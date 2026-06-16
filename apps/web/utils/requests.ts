const HTTP_LINK = process.env.NEXT_PUBLIC_HTTP_URL;

export interface AuthResult {
  token: string;
  error?: string;
}

export interface RoomResult {
  room?: { id: number };
  error?: string;
}

const NETWORK_ERROR = "Cannot reach the server. Please check your connection and try again.";

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    if (body?.message) return body.message;
  } catch {
    // body wasn't JSON
  }
  return fallback;
}

export async function signIn(username: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch(`${HTTP_LINK}/api/v1/user/signIn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const fallback = response.status === 401 || response.status === 403
        ? "Incorrect email or password."
        : `Sign in failed (${response.status}).`;
      return { token: "Invalid", error: await readError(response, fallback) };
    }
    return await response.json();
  } catch (e) {
    console.log(e);
    return { token: "Invalid", error: NETWORK_ERROR };
  }
}

export async function signUp(username: string, password: string, name: string): Promise<AuthResult> {
  try {
    const response = await fetch(`${HTTP_LINK}/api/v1/user/signUp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, name, password }),
    });
    if (!response.ok) {
      const fallback = response.status === 409
        ? "An account with this email already exists."
        : `Sign up failed (${response.status}).`;
      return { token: "Invalid", error: await readError(response, fallback) };
    }
    return await response.json();
  } catch (e) {
    console.log(e);
    return { token: "Invalid", error: NETWORK_ERROR };
  }
}

export async function createRoom(): Promise<RoomResult> {
  try {
    const response = await fetch(`${HTTP_LINK}/api/v1/room/createRoom`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const fallback = response.status === 401 || response.status === 403
        ? "Your session has expired. Please sign in again."
        : `Could not create room (${response.status}).`;
      return { error: await readError(response, fallback) };
    }
    return await response.json();
  } catch (e) {
    console.log(e);
    return { error: NETWORK_ERROR };
  }
}

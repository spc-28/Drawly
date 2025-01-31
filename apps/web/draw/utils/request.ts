import { HTTP_PORT } from "@repo/backend-common/config";

export async function getExistingShapes(roomId: number):Promise<[]> {
  try {
    const response = await fetch(
      `http://localhost:${HTTP_PORT}/api/v1/chat/${roomId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const messages = await response.json();
    return messages;
  }
  catch (e) {
    console.log(e);
    return[];
  }

}

export async function deleteChat(code: string){
  try {
    const response = await fetch(
      `http://localhost:${HTTP_PORT}/api/v1/chat/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body:JSON.stringify({code})
      }
    );
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
  }
  catch (e) {
    console.log(e);

  }

}

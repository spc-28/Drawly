import { HTTP_PORT } from "@repo/backend-common/config";

export async function signIn(username:string, password:string):Promise<{token:string}> {
  try {
    const response = await fetch(
      `http://localhost:${HTTP_PORT}/api/v1/user/signIn`,
      {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
      }
    );
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const  token  = await response.json();
    return token;
  }
  catch (e) {
    console.log(e);
    return{token:"Invalid"};
  }

}

export async function signUp(username:string, password:string, name:string):Promise<{token:string}> {
    try {
      const response = await fetch(
        `http://localhost:${HTTP_PORT}/api/v1/user/signUp`,
        {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              username,
              name,
              password
          })
        }
      );
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      const  token  = await response.json();
      return token;
    }
    catch (e) {
      console.log(e);
      return{token:"Invalid"};
    }
  
  }

  export async function createRoom():Promise<any> {
    try {
      const response = await fetch(
        `http://localhost:${HTTP_PORT}/api/v1/room/createRoom`,
        {
          method: "POST",
          headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              "Content-Type": "application/json"
          }
        }
      );
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      const room = await response.json();
      return room;
    }
    catch (e) {
      console.log(e);
      return null;
    }
  
  }
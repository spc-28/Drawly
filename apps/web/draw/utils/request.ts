const HTTP_LINK = process.env.NEXT_PUBLIC_HTTP_URL;

export interface StoredShape {
  id: string;
  type: string;
  data: any;
}

export async function getExistingShapes(roomId: number): Promise<{ shapes: StoredShape[] }> {
  try {
    const response = await fetch(
      `${HTTP_LINK}/api/v1/shape/${roomId}`,
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

    return await response.json();
  }
  catch (e) {
    console.log(e);
    return { shapes: [] };
  }
}

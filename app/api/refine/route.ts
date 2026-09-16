const MAX_NOTE_LENGTH = 14000;
const PYTHON_SERVICE_URL = "http://127.0.0.1:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const note = body?.input?.note;
    const style = body?.optional?.style ?? "";

    if (typeof note !== "string" || note.trim().length === 0) {
      return Response.json(
        {
          error: "Note is required.",
        },
        { status: 400 },
      );
    }

    if (note.length > MAX_NOTE_LENGTH) {
      return Response.json(
        {
          error: `Note must not exceed ${MAX_NOTE_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    if (typeof style !== "string") {
      return Response.json(
        {
          error: "Style must be a string.",
        },
        { status: 400 },
      );
    }

    const pythonResponse = await fetch(PYTHON_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          note: note.trim(),
        },
        optional: {
          style: style.trim(),
        },
      }),
      cache: "no-store",
    });

    const pythonData = await pythonResponse.json();

    if (!pythonResponse.ok) {
      return Response.json(
        {
          error:
            pythonData?.error ??
            "Python service returned an error.",
        },
        { status: pythonResponse.status },
      );
    }

    return Response.json(pythonData, { status: 200 });
  } catch {
    return Response.json(
      {
        error:
          "Unable to connect to the Python refinement service.",
      },
      { status: 502 },
    );
  }
}
var thread = null

createThread()

window.addEventListener("beforeunload", deleteThread);

async function createThread() {
    var response = await fetch('/createThread', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    var json = await response.json()
    thread = json.thread
}

async function deleteThread() {
    if (!thread) return
    alert(thread)
    await fetch('/deleteThread', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({thread: thread}),
    });
}
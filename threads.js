var threads = []

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

    threads = await response.json()
    // alert(threads)
}

async function deleteThread() {
    if (!threads) return
    alert(threads)
    await fetch('/deleteThread', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({threads: threads}),
    });
}
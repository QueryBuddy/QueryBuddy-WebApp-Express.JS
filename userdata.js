var userId = null

createUserId()

window.addEventListener("beforeunload", userClose);

async function createUserId() {
    var response = await fetch('/createUserId', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    var json = await response.json()
    userId = json.userid
}

async function userClose() {
    if (!userId) return
    alert(userId)
    await fetch('/userClose', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({userid: userId}),
    });
}
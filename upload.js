var photoBtn = document.querySelector('.photo')
var photoArea = document.querySelector('.iframe-area.photo')
var form = document.querySelector('form')

photoBtn.onclick = function(e) {
  photoArea.querySelector('iframe').src = '/photo/take'
  if (photoArea.classList.contains('active')) {
    photoArea.querySelector('iframe').src = ''
  }
  photoArea.classList.toggle('active')
}

var queryString = window.location.search
var urlParams = new URLSearchParams(queryString)

var sucess = urlParams.get('success') === 'true' ? true : false
if (sucess && window.parent !== window && window.parent.handleUpload) {
  window.parent.handleUpload(location.search)
}
else {
  var prompt = urlParams.get('prompt')
  if (!!prompt) {
    form.setAttribute('action', `${form.getAttribute('action')}?p=${prompt}`)
  }
  var type = urlParams.get('type')
  if (!!prompt) {
    form.setAttribute('action', `${form.getAttribute('action')}?t=${type}`)
  }

  var isBulk = urlParams.get('isBulk') === 'true' ? true : false
  if (isBulk) {
    form.setAttribute('action', `${form.getAttribute('action')}?isBulk=${isBulk}`)
  }

  var hasParent = urlParams.get('hasParent') === 'true' ? true : false
  if (hasParent) {
    form.setAttribute('action', `${form.getAttribute('action')}?hasParent=${hasParent}`)
  }
}

function removeActive() {
  photoArea.classList.remove('active')
  photoArea.querySelector('iframe').src = ''
}
document.addEventListener('DOMContentLoaded', function() {
    var images = document.querySelectorAll('.web-mains img');
  
    images.forEach(function(img) {
      img.addEventListener('click', function() {
        var enlargedImg = document.createElement('div');
        enlargedImg.classList.add('enlarged-img');
  
        var imgElement = document.createElement('img');
        imgElement.src = this.src;
  
        var textElement = document.createElement('p');
        var loginLink = document.createElement('a');

        loginLink.href = "http://localhost:5000/Login";
        loginLink.textContent = 'Login';
        textElement.appendChild(loginLink);
        textElement.innerHTML += ' to see price and detail';
  
        enlargedImg.appendChild(imgElement);
        enlargedImg.appendChild(textElement);
  
        document.body.appendChild(enlargedImg);
  
        enlargedImg.addEventListener('click', function() {
          this.remove();
        });
      });
    });
  });
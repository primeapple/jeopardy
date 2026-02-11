const card = document.getElementById('card-sport-100');
const dialog = document.getElementById('question-dialog');
const closeBtn = dialog.querySelector('.btn-close');

card.addEventListener('click', () => {
  card.classList.add('spinning');
  
  setTimeout(() => {
    dialog.showModal();
    card.classList.remove('spinning');
  }, 3000); // Match animation duration
});

closeBtn.addEventListener('click', () => {
  dialog.close();
});

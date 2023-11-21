import axios from 'axios';

type Game = {
    id: number,
    image: string,
    title: string,
    genre: string,
    description: string,
    rating: string,
}
const cardWrapper = document.querySelector<HTMLDivElement>('.js-card-wrapper');
const cardEditButton = document.querySelectorAll<HTMLButtonElement>('.js-edit-button');

const drawCards = () => {
  cardWrapper.innerHTML = '';
  axios.get<Game[]>('http://localhost:3004/games').then(({ data }) => {
    data.forEach((game) => {
      cardWrapper.innerHTML += `
        <div class='card'>
          <img class='card__image' src='${game.image}' alt='game-img'>
          <h1 class='card__title'>${game.title}</h1>
          <p class='card__genre'>${game.genre}</p>
          <p class='card__description'>${game.description}</p>
          <div class='card__rating'>${game.rating}</div>
          <div class='card__creation-date'></div>
          <div class="card__buttons">
            <button class="buttons__edit js-edit-button">Edit</button>
            <button data-game-id='${game.id}' class="buttons__delete js-delete-button">Delete</button>
          </div>
        </div>
        `;
    });
    const cardDeleteButtons = document.querySelectorAll<HTMLButtonElement>('.js-delete-button');
    cardDeleteButtons.forEach((deleteButton) => {
      const deleteId = deleteButton.dataset.gameId;
      deleteButton.addEventListener('click', () => {
        axios.delete<Game>(`http://localhost:3004/games/${deleteId}`).then(() => {
          drawCards();
        });
      });
    });
  });
};
drawCards();

const validateRating = () => {
  const ratingInputs = document.querySelectorAll<HTMLInputElement>('.js-input-rating .js-star-rating ');
  let validRating = false;
  ratingInputs.forEach((star) => {
    if (star.checked) {
      validRating = true;
    }
  });
  if (!validRating) {
    alert('Please fill all the fields');
  }
  return validRating;
};
const gameSubmitForm = document.querySelector<HTMLFormElement>('.js-input-form');
gameSubmitForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!validateRating()) {
    return;
  }

  const formGameTitle = document.querySelector<HTMLInputElement>('input[id="title"]');
  const formGameGenre = document.querySelector<HTMLInputElement>('input[id="genre"]');
  const formGameDescription = document.querySelector<HTMLInputElement>('textarea[id="description"]');
  const formGameRating = document.querySelectorAll<HTMLInputElement>('.js-star-rating');

  const formGameTitleValue = formGameTitle.value;
  const formGameGenreValue = formGameGenre.value;
  const formGameDescriptionValue = formGameDescription.value;
  let formGameRatingValue = '';

  formGameRating.forEach((star) => {
    if (star.checked) {
      formGameRatingValue = star.value;
    }
  });

  axios.post<Game>('http://localhost:3004/games', {
    title: formGameTitleValue,
    genre: formGameGenreValue,
    description: formGameDescriptionValue,
    rating: formGameRatingValue,
  }).then(() => {
    drawCards();
    gameSubmitForm.reset();
  });
});

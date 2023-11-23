import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

type Game = {
    id: number,
    image: string,
    title: string,
    genre: string,
    description: string,
    rating: string,
    creationTime: Date
}
const cardWrapper = document.querySelector<HTMLDivElement>('.js-card-wrapper');

// Function for card creation time (created 'X time ago')

const createdTimeAgo = (creationTime: Date) => {
  const timeElement = document.createElement('div');

  const updateTime = () => {
    const formattedTime = formatDistanceToNow(creationTime, { addSuffix: true });
    timeElement.innerHTML = `Created ${formattedTime}`;
  };

  updateTime();
  setInterval(updateTime, 60000);

  return timeElement.innerHTML;
};

// Function to convert rating to stars

const ratingToStars = (rating: string) => {
  let starRating = '';
  const starClass = 'rating__star';
  const ratingNum = Number(rating);
  for (let i = 0; i < ratingNum; i += 1) {
    starRating += `<div class='${starClass}'>\uF005</div>`;
  }
  return starRating;
};

// Function that acquires data from database

const drawCards = () => {
  cardWrapper.innerHTML = '';
  axios.get<Game[]>('http://localhost:3004/games').then(({ data }) => {
    data.forEach((game) => {
      cardWrapper.innerHTML += `
        <div class='card' data-game-id='${game.id}'>
          <img class='card__image' src='${game.image || '/assets/images/default-image.jpg'}' alt='game-img'>
          <h1 class='card__title'>${game.title}</h1>
          <p class='card__genre'>${game.genre}</p>
          <p class='card__description'>${game.description}</p>
          <div class='card__rating'>${ratingToStars(game.rating)}</div>
          ${createdTimeAgo(game.creationTime)}
          <div class="card__buttons">
            <button class="buttons__edit js-edit-button">Edit</button>
            <button data-game-id='${game.id}' class="buttons__delete js-delete-button">Delete</button>
          </div>
        </div>
        `;
    });

    // Deletes a card and updates html

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

// Draws cards already in database

drawCards();

// Function that validates star rating

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

// Button that adds a new card when pressed with the input values provided

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
  const formGameCreationTime = Date.now();

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
    creationTime: formGameCreationTime,
  }).then(() => {
    drawCards();
    gameSubmitForm.reset();
  });
});

const editGameCard = (gameCardId: number, updatedData: Partial<Game>) => {
  axios.patch<Game>(`http://localhost:3004/games/${gameCardId}`, updatedData)
    .then(() => {
      drawCards();
    });
};
cardWrapper.addEventListener('click', (event) => {
  const editButton = event.target as HTMLElement;
  if (editButton.classList.contains('js-edit-button')) {
    const gameCard = editButton.closest('.card') as HTMLElement;
    if (gameCard) {
      const gameId = Number(gameCard.dataset.gameId || '');
      const originalCardImage = (gameCard.querySelector<HTMLImageElement>('.card__image').src || '/assets/images/default-image.jpg');

      gameCard.innerHTML = `
        <img class='card__image' src='${originalCardImage}' alt='game-img'>
        <input class='card__title edit-mode' id='title-edit' value='${gameCard.querySelector('.card__title').textContent}'>
        <input class='card__genre edit-mode' id='genre-edit' value='${gameCard.querySelector('.card__genre').textContent}'>
        <textarea class='card__description edit-mode' id='description-edit'>${gameCard.querySelector<HTMLTextAreaElement>('.card__description').textContent}</textarea>
        <div class="input__rating js-input-rating">
                <input type="radio" id="star5" name="rating" value="5" class="js-star-rating"/>
                <label class="star" for="star5" title="Awesome" aria-hidden="true"></label>
                <input type="radio" id="star4" name="rating" value="4" class="js-star-rating"/>
                <label class="star" for="star4" title="Great" aria-hidden="true"></label>
                <input type="radio" id="star3" name="rating" value="3" class="js-star-rating"/>
                <label class="star" for="star3" title="Very good" aria-hidden="true"></label>
                <input type="radio" id="star2" name="rating" value="2" class="js-star-rating"/>
                <label class="star" for="star2" title="Good" aria-hidden="true"></label>
                <input type="radio" id="star1" name="rating" value="1" class="js-star-rating"/>
                <label class="star" for="star1" title="Bad" aria-hidden="true"></label>
            </div>
        <div class="card__buttons">
          <button class="buttons__save js-save-button">Save</button>
        </div>
      `;
      const saveButton = gameCard.querySelector<HTMLButtonElement>('.js-save-button');
      saveButton.addEventListener('click', () => {
        const selectedStar = gameCard.querySelector<HTMLInputElement>('.js-star-rating:checked');
        const updatedData = {
          title: (gameCard.querySelector<HTMLElement>('.card__title') as HTMLInputElement).value,
          genre: (gameCard.querySelector<HTMLElement>('.card__genre') as HTMLInputElement).value,
          description: (gameCard.querySelector<HTMLElement>('.card__description') as HTMLTextAreaElement).value,
          rating: selectedStar.value,
        };
        editGameCard(gameId, updatedData);
      });
    }
  }
});

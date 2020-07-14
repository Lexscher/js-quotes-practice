// URLS
const quotesURL = 'http://localhost:3000/quotes';
const getQuotesURL = quotesURL + '?_embed=likes';
const likesURL = 'http://localhost:3000/likes';

const state = {
  sorted: false,
};

// dom alias
const qs = (tag) => document.querySelector(tag);
const ce = (tag) => document.createElement(tag);

// DOM Elements from page
const quoteList = qs('#quote-list');
const quoteForm = qs('#new-quote-form');

const clearQuotesList = () => (quoteList.innerHTML = '');

const sortButton = ce('button');
sortButton.classList.add('btn-success');
sortButton.innerText = 'Sort by Author: OFF';
sortButton.addEventListener('click', (evt) => {
  state.sorted = !state.sorted;
  fetchAllQuotes();
  sortButton.innerText = 'Sort by Author: ' + (state.sorted ? 'ON' : 'OFF');
});
// debugger
quoteList.parentElement.prepend(sortButton);

quoteForm.addEventListener('click', (evt) => {
  if (evt.target.type == 'submit') {
    evt.preventDefault();
    const quoteObj = {};
    [quoteObj.quote, quoteObj.author] = [
      evt.currentTarget[0].value,
      evt.currentTarget[1].value,
    ];

    createQuote(quoteObj);
  }
});

const fetchAllQuotes = () => {
  clearQuotesList();
  fetch(getQuotesURL)
    .then((response) => response.json())
    .then((quotesData) => {
      const quotesList = state.sorted
        ? [...quotesData].sort((a, b) => (a.author > b.author ? 1 : -1))
        : quotesData;
      quotesList.forEach(slapQuoteOnDOM);
    });
};

fetchAllQuotes();

const slapQuoteOnDOM = ({ author, id, likes, quote, quoteId }) => {
  if (quoteId != undefined) return;
  //   debugger;
  let likeCount = likes ? likes.length : 0;
  // create the quote
  const quoteLi = ce('li');
  quoteLi.classList.add('quote-card');
  const blockquote = ce('blockquote');
  blockquote.classList.add('blockquote');
  quoteLi.appendChild(blockquote);
  const deleteButton = ce('button');
  deleteButton.classList.add('btn-danger');
  deleteButton.innerText = 'Delete';

  const likeButton = ce('button');
  likeButton.classList.add('btn-success');
  likeButton.innerHTML = `Likes: <span>${likeCount}</span>`;

  //   event listeners
  likeButton.addEventListener('click', (evt) => {
    // debugger;
    likeQuote(id)
      .then((res) => res.json())
      .then((likeData) => {
        // debugger;
        likeCount = likeButton.firstElementChild.innerText = likeCount + 1;
      });
  });

  deleteButton.addEventListener('click', (evt) => {
    deleteQuote(id)
      .then((res) => res.json())
      .then(quoteLi.remove());
  });

  // populate the data
  blockquote.innerHTML = `
    <p class="mb-0">${quote}</p>
    <footer class="blockquote-footer">${author}</footer>
    <br>
    `;

  // slap it on our quoteList
  quoteList.appendChild(quoteLi);
  blockquote.appendChild(deleteButton);
  blockquote.appendChild(likeButton);
};

// handle the like creation
const createQuote = (quoteObj) => {
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ ...quoteObj }),
  };

  fetch(quotesURL, config)
    .then((res) => res.json())
    .then(slapQuoteOnDOM);
};

// handle deleting button
const deleteQuote = (id) => {
  const config = {
    method: 'DELETE',
    'Content-Type': 'application/json',
  };

  return fetch(quotesURL + '/' + id, config);
};

// handle like button
const likeQuote = (quoteId) => {
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ quoteId, createdAt: Date.now() }),
  };

  return fetch(likesURL, config);
};

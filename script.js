const postsContainer = document.querySelector('.posts');
const loader = document.querySelector('.dots');
const searchField = document.querySelector('input#search');

let page = 1;

const getPosts = async () => {
  const datas = await fetch(`https://jsonplaceholder.typicode.com/posts?_limit=5&_page=${page}`);
  return await datas.json();
}

const generatePostsTemplate = (acc, { id, title, body }) => {
  return acc +=`
    <div class="post">
      <span class="post-id">${id}</span>
      <h1 class="post-title">${title}</h1>
      <p class="post-body">${body}</p>
    </div>
  `;
}

const insertPostsIntoDOM = async () => {
  try {
    const posts = await getPosts();
    if (posts.length === 0) throw new Error('No Posts!');

    const postsTemplate = posts.reduce(generatePostsTemplate, '');
    postsContainer.innerHTML += postsTemplate;
  } catch (error) {
    if (error) throw new Error(error);
  }
}

const getNextPosts = () => {
  page++;
  insertPostsIntoDOM();
}

const removeLoader = () => {
  setTimeout(() => {
    loader.classList.remove('show');
    getNextPosts();
  }, 1000);
}

const showLoader = () => {
  loader.classList.add('show');
  removeLoader();
}

const handleWindowScrollEvent = () => {
  const wasTheEndOfThePageRead = window.innerHeight + window.pageYOffset + 10
   >= document.documentElement.scrollHeight;

  const atTheBottomOfThePageAndNotSearching = wasTheEndOfThePageRead
    && !loader.classList.contains('searching');
  
    if (atTheBottomOfThePageAndNotSearching) showLoader();
}

const debounce = (cb, delay) => {
  let timer;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      cb(...args);
      timer = null;
    }, delay);
  };
}

const getPostTextAndFormat = (main, selector) => {
  return main.querySelector(selector).textContent.toLowerCase();
}

const filterPostsBasedOnTheTypedWord = (typedWord) => (post) => {
  const postTitle = getPostTextAndFormat(post, '.post-title');
  const postBody = getPostTextAndFormat(post, '.post-body');

  const isThisTypedWordIncluded = postTitle.includes(typedWord)
    || postBody.includes(typedWord);
  
  
  post.style.display = 'none';
  if (isThisTypedWordIncluded) post.style.display = 'block';
}

const handleInputValue = (e) => {
  const typedWord = e.target.value.toLowerCase().trim();
  const posts = [...document.querySelectorAll('.post')];

  loader.classList.remove('searching');
  if (typedWord !== '') loader.classList.add('searching');
  
  posts.forEach(filterPostsBasedOnTheTypedWord(typedWord));
}

const loadTheFirstTenPosts = () => {
  insertPostsIntoDOM();
  setTimeout(() => getNextPosts(), 500);
}

loadTheFirstTenPosts();

window.addEventListener('scroll', debounce(handleWindowScrollEvent, 200));
searchField.addEventListener('input', handleInputValue);

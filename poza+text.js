// react
import React from 'react';
import { Form, redirect } from 'react-router-dom';

// css
// import './Home.css';

const Home = () => (
  <div id="home">
    home
    <Form method="post">
      <label htmlFor="score-input">
        <span>Your score:</span>
        <input id="score-input" type="text" name="score" />
      </label>
      <img src="#" alt="selected" id="image" />
      <label htmlFor="image-input">
        <input
          id="image-input"
          type="file"
          accept=".jpg, .jpeg, .png"
          onChange={handleImageInput}
          name="picture"
        />
      </label>
      <button type="submit">Submit</button>
    </Form>
  </div>
);

function handleImageInput() {
  const img = document.getElementById('image');
  const input = document.getElementById('image-input');

  const [file] = input.files;
  if (file) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.addEventListener('load', () => {
      img.src = fileReader.result;
    });
  }
}

export const formAction = async ({ request }) => {
  const data = await request.formData();

  const score = data.get('score');
  const picture = data.get('picture');

  const input = document.getElementById('image-input');
  const [file] = input.files;
  if (file) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.addEventListener('load', () => {
      // console.log(fileReader.result);
    });
  }
  // console.log({ score, picture });

  return redirect('/');
};

export default Home;

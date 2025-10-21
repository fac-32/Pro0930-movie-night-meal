window.addEventListener("load", function () {
  const signInBtn = document.querySelector(".g_id_signin");
  const signOutBtn = document.querySelector(".g_id_signout");
  const userContainer = document.querySelector(".userDetails");

  console.log("this is working");
  console.log(window.location.origin);

  signOutBtn.style.display = "none";
  userContainer.style.display = "none";

  signOutBtn.addEventListener("click", () => {
    console.log("signout button was clicked");
    userContainer.textContent = "";
    signOutBtn.style.display = "none";
    signInBtn.style.display = "block";
    google.accounts.id.disableAutoSelect();
    console.log("User signed out");
  });

  google.accounts.id.initialize({
    client_id:
      "693400949255-0375vn82b9l3j9dqvlkp9se04a2sc5tj.apps.googleusercontent.com",
    callback: handleCredentialResponse,
    use_fedcm_for_prompt: false,
  });

  google.accounts.id.renderButton(signInBtn, {
    theme: "outline",
    size: "small",
  });
});

async function handleCredentialResponse(response) {
  const token = response.credential;
  localStorage.setItem("token", token);

  const validity = await fetch("/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const responsePayload = decodeJwtResponse(response.credential);

  const userContainer = document.querySelector(".userDetails");
  const signInBtn = document.querySelector(".g_id_signin");
  const signOutBtn = document.querySelector(".g_id_signout");

  userContainer.textContent = `Hello, ${responsePayload.given_name}`;
  console.log(`username = ${responsePayload.given_name}`);
  console.log(`email = ${responsePayload.email}`);

  localStorage.setItem("userEmail", responsePayload.email);

  //await loadWishlist();

  userContainer.style.display = "block";
  signInBtn.style.display = "none";
  signOutBtn.style.display = "block";

  await loadWishlist();
}

/*
async function handleCredentialResponse(response) {
  const token = response.credential;
  localStorage.setItem("token", token);
  const validity = await fetch("/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  //   window.location.href = '../index.html';

  const responsePayload = decodeJwtResponse(response.credential);

  const userContainer = document.querySelector(".userDetails");
  const signInBtn = document.querySelector(".g_id_signin");
  const signOutBtn = document.querySelector(".g_id_signout");

  userContainer.textContent = `Hello, ${responsePayload.given_name}`;
  console.log(`username = ${responsePayload.given_name}`);
  let email = responsePayload.email;
  console.log(email);
  userContainer.style.display = "block";
  signInBtn.style.display = "none";
  signOutBtn.style.display = "block";
}*/

window.handleCredentialResponse = handleCredentialResponse;

function decodeJwtResponse(token) {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  let jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );

  return JSON.parse(jsonPayload);
}

// WISHLIST //

async function loadWishlist() {
  const email = localStorage.getItem("userEmail");
  const wishlistContainer = document.getElementById("wishlistMoviesContainer");
  wishlistContainer.innerHTML = ""; // clear it first

  if (!email) {
    wishlistContainer.innerHTML = `<p class="emptyWishlistMsg">Please sign in to view your wishlist.</p>`;
    return;
  }

  try {
    const res = await fetch(`/api/whishlist?userEmail=${email}`);
    if (res.ok) {
      const movieList = await res.json();
      const movieExists = movieList.includes(movie.title);
      console.log(movieList);
    }
  } catch (error) {}
}

const appSection = document.querySelector(".app")
const modalTitle = document.querySelector(".modal-title")
const modalBody = document.querySelector(".modal-body")

const addBtn = document.querySelector(".add-btn")

const toastBody = document.querySelector(".toast-body")

/*  base url for the API  */
const baseUrl = "https://replit.com/@yacinetimazguid/Flask"

/*  event listeners */
// ADD btn
addBtn.addEventListener("click", () => {
	modalTitle.textContent = "Add a book"
	modalBody.innerHTML = `
                <form>
                   	<div class="mb-3">
				   		<label for="title" class="form-label">Title</label>
				   		<input required type="text" class="form-control" id="title"  >
                    </div>
                    <div class="mb-3">
                        <label for="imageUrl" class="form-label">Image URL</label>
                        <input required type="text" class="form-control" id="imageUrl"  >
						<div class="img-preview d-none"></div>
					</div>
						<div class="d-grid">
                        <button type="submit" class="btn btn-dark">Save</button>
					</div>
				</form>
				
				`

	const imageUrlDOM = document.querySelector("#imageUrl")
	// console.log(imageUrlDOM)

	imageUrlDOM.addEventListener("input", () => {
		const imagePreview = document.querySelector(".img-preview")
		const formulaire = document.querySelector("form")

		imagePreview.classList.remove("d-none")
		imagePreview.innerHTML = `<img src="${imageUrlDOM.value}" alt="image preview" class="mt-2 img-thumbnail" > `

		formulaire.addEventListener("submit", (e) => {
			const newValue = formulaire.title.value
			const newImage = formulaire.imageUrl.value
			e.preventDefault()
			postNewBook(newValue, newImage)
			console.log(newValue, newImage)
		})
	})
})

/*  app inisialilzation  */
const appInit = () => {
	fetchData(baseUrl, writeHtml)
}

/**
 * Fetches data from the specified URL and invokes the callback with the retrieved data.
 *
 * @param {string} url - The URL from which to fetch the data.
 * @param {(data: any) => void} callback - The callback function to be invoked with the retrieved data.
 * @throws {TypeError} Will throw an error if url is not a string or callback is not a function.
 */

const fetchData = (url, callback) => {
	fetch(url)
		.then((res) => {
			if (res.ok) {
				res.json().then((data) => {
					callback(data)
				})
			} else {
				appSection.innerHTML = `<h2 class='text-danger text-center'>Error fetching data ...</h2>
                    <img src="./assets/offline.gif" alt="offline" >
                    `
			}
		})
		.catch(
			(err) =>
				(appSection.innerHTML = `<h2 class='text-danger text-center'>Error fetching data ...</h2>
                <p>${err}</p>
                    <img src="./assets/	offline.gif" alt="offline" >
                    `)
		)
}

/**
 * Writes HTML content for each book in the provided array and appends it to the appSection.
 *
 * @param {Array} livres - An array containing book objects.
 * @throws {TypeError} Will throw an error if livres is not an array.
 */
const writeHtml = (livres) => {
	document.querySelector(".spinner-container").style.display = "none"
	if (livres.length > 0) {
		livres.forEach((livre) => {
			appSection.innerHTML += `
            <div class="col">
				<article class="card" id="${livre.id}">                
					<img src="${livre.imageUrl}" class="card-img-top" alt="...">
					<div class="card-body">
					<h5 class="card-title">${livre.title}</h5>
					<button data-bs-toggle="modal"
					data-bs-target="#bookModal" 
					class="btn btn-dark edit">Edit</button>
					</div>    
				</article>
            </div>
            `
		})
	} else {
		appSection.innerHTML = "<h2>no books found ... </h2>"
	}
	const editBtnArray = document.querySelectorAll(".edit")
	handleClicks(editBtnArray, livres)
}

/*  handle clicks  */
/**
 *
 * @param {NodeList|HTMLCollection|Array} btnsArray // nodes from the DOM
 * @param {Array} objects // an array of items
 */
const handleClicks = (btnsArray, objects) => {
	btnsArray.forEach((btn, i) => {
		btn.addEventListener("click", () => {
			modalTitle.textContent = "Edit mode"
			modalBody.innerHTML = `
                <form>
                   <div class="mb-3">
                        <label for="title" class="form-label">Title</label>
                        <input required type="text" class="form-control" id="title" value="${objects[i].title}" >
                    </div>
                    <div class="mb-3">
                        <label for="imageUrl" class="form-label">Image URL</label>
                        <input required type="text" class="form-control" id="imageUrl" value="${objects[i].imageUrl}" >
                    </div>
                    <div class="d-grid">
                        <button type="submit" class="btn btn-dark">Save</button>
                        <button type="button" class="btn btn-danger mt-2">Delete</button>

                    </div>
                </form>
            `
			const formulaire = document.querySelector("form")
			const deleteBtn = document.querySelector(".btn-danger")

			formulaire.addEventListener("submit", (e) => {
				e.preventDefault()
				handleFormSubmit(
					formulaire.title.value,
					formulaire.imageUrl.value,
					objects[i].id
				)
			})

			/*  delete click  */
			deleteBtn.addEventListener("click", () => {
				if (confirm("vous alez delete un titre !")) {
					deleteRequest(objects[i].id)
				}
			})
		})
	})
}

/*  handle submit  */
const handleFormSubmit = (newTitle, newImageUrl, bookId) => {
	console.log(newTitle, newImageUrl, bookId)
	postData(newTitle, newImageUrl, bookId)
}
/* post data  */
const postData = (newTitle, newImageUrl, bookId) => {
	const myModalEl = document.querySelector("#bookModal")
	const modal = bootstrap.Modal.getInstance(myModalEl)

	/*  POST FETCH  */
	const url = `https://basic-rest-flask.martinpedraza.repl.co/api/books/${bookId}`

	const data = {
		title: newTitle,
		imageUrl: newImageUrl,
	}

	const options = {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	}

	fetch(url, options)
		.then((response) => response.json())
		.then((data) => {
			// console.log("Response:", data)
			modal.hide()
			appSection.style.display = "none"
			// show confirmation mesasge
			const toastLiveExample = document.getElementById("liveToast")
			const toast = new bootstrap.Toast(toastLiveExample)
			toastBody.textContent = data.msg
			toast.show()
			// update DOM
			const selectedCard = document.getElementById(`${bookId}`)
			fetch(url).then((res) => {
				res.json().then((data) => {
					selectedCard.children[0].src = data.imageUrl
					selectedCard.children[1].children[0].textContent = data.title
				})
			})
			setInterval(() => {
				toast.hide()
				appSection.style.display = "flex"
			}, 1650)
			// console.log(selectedCard)
		})
		.catch((error) => {
			console.error("Error:", error)
			// Handle any errors
		})
}

/*  add new book  */
const postNewBook = (newValue, newImage) => {
	/* select modal  */
	const myModalEl = document.querySelector("#bookModal")
	const modal = bootstrap.Modal.getInstance(myModalEl)

	/*  POST FETCH  */
	const url = `https://replit.com/@yacinetimazguid/Flask/api/books`

	const data = {
		title: newValue,
		imageUrl: newImage,
	}

	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	}

	fetch(url, options).then((response) => {
		// console.log(response.json())
		modal.hide()
		appSection.innerHTML = ""
		fetchData(baseUrl, writeHtml)
	})
}

/*  delete request  */
const deleteRequest = (bookId) => {
	/* delete modal */
	const myModalEl = document.querySelector("#bookModal")
	const modal = bootstrap.Modal.getInstance(myModalEl)

	const url = `https://replit.com/@yacinetimazguid/Flask/api/books${bookId}`
	const options = {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
	}

	/*  delete request */
	fetch(url, options)
		.then((response) => response.json())
		.then((data) => {
			console.log(data)
			modal.hide()
			appSection.innerHTML = ""
			fetchData(baseUrl, writeHtml)
		})
}
appInit()

/*
fetch("https://basic-rest-flask.martinpedraza.repl.co/api/books")
	.then((response) => response.json())
	.then((livres) => {
		livres.forEach((livre) => {
			appSection.innerHTML += `
            <div class="col">
                <article class="card">                
                    <img src="${livre.imageUrl}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${livre.title}</h5>
                        <button data-bs-toggle="modal"
			                    data-bs-target="#bookModal" 
                                class="btn btn-dark edit">Edit</button>
                    </div>    
                </article>
            </div>
            `
		})
		const editBtnArray = document.querySelectorAll(".edit")
		console.log(editBtnArray, "select btns ...")
	})
    */

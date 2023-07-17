document.addEventListener("DOMContentLoaded", function () {
  const url = "https://dummyjson.com/products";
  const pageSizeSelect = document.getElementById("page-size");
  const prevButton = document.querySelector(".prev-button");
  const nextButton = document.querySelector(".next-button");
  const paginationDisplay = document.getElementById("pagination-display");
  const userTable = document.getElementById("userTable");
  const searchButton = document.querySelector(".Product-btn-search");
  const productNameInput = document.getElementById("product-name");
  const customerTypeInput = document.getElementById("customer-type");
  const descriptionInput = document.getElementById("description");
  const addProductForm = document.getElementById("add-product-form");
  const addNewButton = document
    .getElementById("Product-btn-add")
    .querySelector("button");
  const backButton = document.getElementById("clear-button");
  const saveButton = document.getElementById("btn-add-product");

  let currentPage = 0;
  let pageSize = parseInt(pageSizeSelect.value);
  let totalItems = 0;
  let totalPages = 0;


  function start() {
    addEventListeners(); 
    console.log(localStorage.getItem("productList"));
    if (!localStorage.getItem("productList")) {
      getCourses(saveDataAndRender); 
    } else {
      renderFromLocalStorage(); 
    }
    if (window.location.pathname.includes("index.html")) {
      renderFromLocalStorage();
    }
  }

  // Hàm thêm event listener
  function addEventListeners() {
    pageSizeSelect.addEventListener("change", handlePageSizeChange);
    prevButton.addEventListener("click", handlePrevButtonClick);
    nextButton.addEventListener("click", handleNextButtonClick);
    searchButton.addEventListener("click", handleSearchButtonClick);
    addNewButton.addEventListener("click", handleAddNewButtonClick);
    backButton.addEventListener("click", handleBackButtonClick);
    saveButton.addEventListener("click", handleSaveButtonClick);
  }

  // Hàm lấy dữ liệu từ API 
  function getCourses(callback) {
    fetch(url)
      .then(function (res) {
        return res.json();
      })
      .then(callback);
  }

  // Hàm lưu dữ liệu vào localStorage và render
  function saveDataAndRender(data) {
    localStorage.setItem("productList", JSON.stringify(data.products));
    renderApi(data);
  }

  // Render dữ liệu từ localStorage
  function renderFromLocalStorage() {
    const productListString = localStorage.getItem("productList");
    if (productListString) {
      const productList = JSON.parse(productListString);
      const data = {
        products: productList,
      };
      renderApi(data);
    }
  }

  // Render dữ liệu từ API
  function renderApi(data) {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.products.slice(startIndex, endIndex);

    let htmls = "";
    paginatedData.forEach((page) => {
      htmls += `
        <tr data-id="${page.id}">
          <th class="product-id">${page.id}</th>
          <th>${page.title}</th>
          <th>${page.brand}</th>
          <th>${page.category}</th>
          <th>${page.description}</th>
          <th>
          <button class="edit-button"><i class="fas fa-edit"></i></button>
            <button class="delete-button"><i class="far fa-trash-alt" data-id="${page.id}"></i></button>
          </th>
        </tr>`;
    });

    userTable.innerHTML = htmls;
    totalItems = data.products.length;
    totalPages = Math.ceil(totalItems / pageSize);
    updatePaginationDisplay();

    // Bắt sự kiện click cho từng hàng
    const productIds = document.querySelectorAll("#userTable th.product-id");
    productIds.forEach((productIdElement) => {
      productIdElement.addEventListener("click", () => {
        const productId = productIdElement.textContent;
        showPopup(productId);
      });
    });

    // Bắt sự kiện click cho nút Edit
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const productId = button.parentElement.parentElement.dataset.id;
        showEditPopup(productId);
      });
    });

    // Bắt sự kiện click cho nút xóa
    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", handleDeleteButtonClick);
    });
  }

  function showPopup(productId) {
    // Lấy thông tin sản phẩm từ local storage hoặc từ API
    const productListString = localStorage.getItem("productList");
    if (productListString) {
      const productList = JSON.parse(productListString);
      const product = productList.find(
        (product) => product.id === parseInt(productId)
      );

      // Tạo popup
      const popup = document.createElement("div");
      popup.classList.add("popup");
      popup.innerHTML = `
        <div class="popup-content">
          <h2>Product Details</h2>
          <p><strong>ID:</strong> ${product.id}</p>
          <p><strong>Title:</strong> ${product.title}</p>
          <p><strong>Brand:</strong> ${product.brand}</p>
          <p><strong>Category:</strong> ${product.category}</p>
          <p><strong>Description:</strong> ${product.description}</p>
          <button class="close-button">Close</button>
        </div>`;

      // Thêm popup vào body
      document.body.appendChild(popup);

      // Bắt sự kiện click cho nút đóng popup
      const closeButton = popup.querySelector(".close-button");
      closeButton.addEventListener("click", () => {
        document.body.removeChild(popup);
      });
    }
  }

  function showEditPopup(productId) {
    // Lấy thông tin sản phẩm từ local storage hoặc từ API
    const productListString = localStorage.getItem("productList");
    if (productListString) {
      const productList = JSON.parse(productListString);
      const product = productList.find(
        (product) => product.id === parseInt(productId)
    );

      // Tạo popup
      const popup = document.createElement("div");
      popup.classList.add("popup");
      popup.innerHTML = `
        <div class="popup-content">
          <h2>Edit Product</h2>
          <form id="edit-product-form">
            <input type="text" id="edit-product-name" value="${product.title}">
            <input type="text" id="edit-brand-name" value="${product.brand}">
            <input type="text" id="edit-category" value="${product.category}">
            <textarea id="edit-description">${product.description}</textarea>
            <button type="submit">Save</button>
            <button class="close-button">Close</button>
          </form>
        </div>`;

      // Thêm popup vào body
      document.body.appendChild(popup);

      // Bắt sự kiện submit form
      const editProductForm = document.getElementById("edit-product-form");
      editProductForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const editedProduct = {
          id: parseInt(productId),
          title: document.getElementById("edit-product-name").value.trim(),
          brand: document.getElementById("edit-brand-name").value.trim(),
          category: document.getElementById("edit-category").value.trim(),
          description: document.getElementById("edit-description").value.trim(),
        };

        // Lưu thông tin sản phẩm đã chỉnh sửa vào local storage
        saveEditedProduct(editedProduct);
        document.body.removeChild(popup);
        renderFromLocalStorage();
      });

      // Bắt sự kiện click cho nút đóng popup
      const closeButton = popup.querySelector(".close-button");
      closeButton.addEventListener("click", () => {
        document.body.removeChild(popup);
      });
    }
  }

  function saveEditedProduct(product) {
    const productListString = localStorage.getItem("productList");
    if (productListString) {
      const productList = JSON.parse(productListString);
      const updatedProductList = productList.map((p) => {
        if (p.id === product.id) {
          return product;
        }
        return p;
      });
      localStorage.setItem("productList", JSON.stringify(updatedProductList));
    }
  }

  // Xử lý sự kiện click nút xóa
  function handleDeleteButtonClick(event) {
    const productId = event.target.dataset.id;
    const productListString = localStorage.getItem("productList");

    if (productListString) {
      const confirmDelete = confirm(
        "Are you sure you want to delete this product?"
      );
      if (confirmDelete) {
        const productList = JSON.parse(productListString);
        const updatedProductList = productList.filter(
          (product) => product.id !== parseInt(productId)
        );

        localStorage.setItem("productList", JSON.stringify(updatedProductList));
        renderFromLocalStorage(); 
      }
    }
  }

  // Xử lý sự kiện thay đổi kích thước trang
  function handlePageSizeChange() {
    pageSize = parseInt(pageSizeSelect.value);
    currentPage = 0;
    renderFromLocalStorage();
  }

  // Xử lý sự kiện click nút trang trước
  function handlePrevButtonClick() {
    if (currentPage > 0) {
      currentPage--;
      renderFromLocalStorage();
    }
  }

  // Xử lý sự kiện click nút trang tiếp theo
  function handleNextButtonClick() {
    if (currentPage < totalPages - 1) {
      currentPage++;
      renderFromLocalStorage();
    }
  }

  // Hàm xử lý sự kiện click nút tìm kiếm
  function handleSearchButtonClick() {
    const searchValue = productNameInput.value.trim();

    if (searchValue === "" || searchValue === null) {
      renderFromLocalStorage();
    } else {
      const productList = getProductListFromStorage();
      const filteredList = productList.filter((product) =>
        product.title.toLowerCase().includes(searchValue.toLowerCase())
      );
      const data = {
        products: filteredList,
      };
      renderApi(data);
    }
  }

  //Hàm xử lý sự kiện click nút thêm sản phẩm mới
  function handleAddNewButtonClick() {
    const productRightDiv = document.getElementById("Product-right2");
    productRightDiv.style.display = "block";
  }

  //Hàm xử lý sự kiện click nút quay lại
  function handleBackButtonClick() {
    const productRightDiv = document.getElementById("Product-right2");
    productRightDiv.style.display = "none";
  }

  //Hàm xử lý sự kiện click nút lưu sản phẩm mới
  function handleSaveButtonClick(event) {
    event.preventDefault();

    const productName = document
      .getElementById("product-name-add")
      .value.trim();
    const activeSelect = document.getElementById("active-select").value;
    const customerType = customerTypeInput.value.trim();
    const description = descriptionInput.value.trim();

    console.log(productName, activeSelect, customerType, description);
    // Tạo đối tượng sản phẩm mới
    const newProduct = {
      id: generateNewProductId(),
      title: productName,
      brand: customerType,
      category: activeSelect,
      description: description,
    };

    // Thêm sản phẩm mới vào danh sách và lưu vào localStorage
    const productList = getProductListFromStorage();
    productList.push(newProduct);
    saveProductListToStorage(productList);

    // Hiển thị lại danh sách sản phẩm
    renderFromLocalStorage();

    // Reset form và thông báo thành công
    addProductForm.reset();
    alert("Product added successfully!");

    userTable.classList.remove("hidden");
    addProductForm.classList.add("hidden");
  }

  // Tạo ID mới cho sản phẩm
  function generateNewProductId() {
    const productList = getProductListFromStorage();
    if (productList.length === 0) {
      return 1;
    } else {
      const lastProductId = productList[productList.length - 1].id;
      return lastProductId + 1;
    }
  }

  // Lấy danh sách sản phẩm từ localStorage
  function getProductListFromStorage() {
    const productListString = localStorage.getItem("productList");
    if (productListString) {
      return JSON.parse(productListString);
    } else {
      return [];
    }
  }

  // Lưu danh sách sản phẩm vào localStorage
  function saveProductListToStorage(productList) {
    localStorage.setItem("productList", JSON.stringify(productList));
  }

  // Cập nhật hiển thị phân trang
  function updatePaginationDisplay() {
    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalItems);
    paginationDisplay.textContent = `Displaying: ${startItem} - ${endItem} of ${totalItems}`;
  }

  start();
});

"use strict"

let {type, category} = getCategory();

// const responseCategory = await fetch('https://gribbirg.github.io/AutoPartsStoreWebsiteFrontend/data/categories.json');
const responseCategory = await fetch('../../data/categories.json');
const typeData = (await responseCategory.json()).find(function (item) {
    return item.id === type;
});
if (!typeData)
    window.location.href = "/AutoPartsStoreWebsiteFrontend/catalog/";

if (!category || category === "null")
    goToCategory(type, typeData["subcategories"][0].id);

const categoryData = typeData["subcategories"].find(function (item) {
    return item.id === category;
});
if (!categoryData)
    goToCategory(type, typeData["subcategories"][0].id);

// const response = await fetch(`https://gribbirg.github.io/AutoPartsStoreWebsiteFrontend/data/products/${type}/${category}.json`);
const response = await fetch(`../../data/products/${type}/${category}.json`);
const data = await response.json();

setCategoriesOfType(typeData);

let content = data;
addCategory(category);
onSortDivClickListener(document.getElementById("cost_sort"));

createFilters(categoryData);

window.addEventListener("pageshow", function () {
    content.forEach(function (item) {
        setButtonsState(item.id);
    })
});

function getCategory() {
    let search = new URLSearchParams(window.location.search)
    let type = search.get("type");
    if (!type || type === "null") {
        window.location.href = "/AutoPartsStoreWebsiteFrontend/catalog/";
    }
    let category = search.get("category");
    return {type, category};
}

function goToCategory(type, category) {
    window.location.href = `?type=${type}&category=${category}`;
}

function setCategoriesOfType(typeData) {
    let fieldSet = document.getElementById("category_filter");
    for (let category of typeData["subcategories"]) {
        fieldSet.innerHTML += `<a href="?type=${type}&category=${category.id}" id="${category.id}_ref">${category.name}</a>`
    }
}

function setCategoryName(name) {
    if (name) {
        document.title = name;
        document.body.querySelector("#products_section .part_name").innerHTML = name;
    }
}

function createFilters(categoryData) {
    let div = document.getElementById("filters_div");
    if (categoryData["filters"]) {
        for (let filter of categoryData["filters"]) {
            if (filter.type === "choice") {
                div.innerHTML +=
                    `<fieldset class="field choice_filter" id="${filter.id}_choice_filter">
                     <legend>${filter.name}:</legend>
                 </fieldset>`

                let fieldset = document.getElementById(`${filter.id}_choice_filter`);
                for (let i = 0; i < filter.options.length; i++) {
                    fieldset.innerHTML +=
                        `<label for="${filter.id}_${i}_filter">
                        <input type="checkbox" name="${filter.id}_input" id="${filter.id}_${i}_filter" class="field">
                        ${filter.options[i]}
                    </label>`
                }
            } else if (filter.type === "num") {
                div.innerHTML +=
                    `<fieldset class="field num_filter" id="${filter.id}_num_filter">
                    <legend class="legend">${filter.name}:</legend>
                    <div>
                        <label for="${filter.id}_from_filter">От:</label>
                        <input type="number" id="${filter.id}_from_filter" class="field">
                        <span>${filter.unit}</span>
                    </div>
                    <div>
                        <label for="${filter.id}_to_filter">До:</label>
                        <input type="number" id="${filter.id}_to_filter" class="field">
                        <span>${filter.unit}</span>
                    </div>
                </fieldset>`
            }
        }
    }
}

function createProductDiv(product) {
    document.getElementById("products_div").innerHTML +=
        `<div class="product_div">
            <a href="/AutoPartsStoreWebsiteFrontend/catalog/product/?type=${type}&category=${category}&product=${product.id}"></a>
            <h3 class="product_head">${product.name}</h3>
            <div class="product_img_div">
                <img src=${"/AutoPartsStoreWebsiteFrontend/images/products/" + product["img"]} alt=${product.name}/>
            </div>
            <p class="product_desc">${product.description}</p>
            <p class="product_cost">${product["cost"].toLocaleString() + " ₽"}</p>
            <div class="product_div_button">
                <button class="product_buy_button arrow_button" id="${product.id}+buy_button">
                    Купить
                    <span></span>
                </button>
                <button class="product_basket_button arrow_button cart_sub_button" id="${product.id}+cart_sub_button">-</button>
                <a href="/AutoPartsStoreWebsiteFrontend/cart"><button class="product_basket_button arrow_button cart_button" id="${product.id}+cart_button">
                    В корзине 1 шт
                    <span></span>
                </button></a>
                <button class="product_basket_button arrow_button cart_add_button" id="${product.id}+cart_add_button">+</button>
            </div>
        </div>`;
}

function getCurrentProductsDisplayCount() {
    return document.querySelectorAll(".product_div").length;
}

function setContent(content) {
    document.getElementById("products_div").innerHTML = "";
    if (content.length !== 0) {
        for (let i = 0; i < Math.min(6, content.length); i++) {
            createProductDiv(content[i]);
            setButtonsState(content[i].id);
        }
        setProductsButtonsOnClick(type, category);
        while (content.length !== document.querySelectorAll(".product_div").length &&
        document.documentElement.getBoundingClientRect().bottom <= document.documentElement.clientHeight + 100 + document.querySelector("footer").offsetHeight) {
            addProducts(content);
        }
    } else {
        document.getElementById("products_div").innerHTML +=
            `
            <p>По заданным критериям ничего не найдено.</p>
            `;
    }
}

function addProducts(content) {
    let count = getCurrentProductsDisplayCount();
    for (let i = count; i < Math.min(count + 2, content.length); i++) {
        createProductDiv(content[i]);
        setProductsButtonsOnClick(type, category);
        setButtonsState(content[i].id);
    }
}

function addCategory(category) {
    document.getElementById(`${category}_ref`).classList.add("checked");
    setCategoryName(typeData["subcategories"].find(function (item) {
        return item.id === category;
    }).name);
    for (let product of content) {
        createProductDiv(product);
    }
}

function offSortDivs(onDiv) {
    for (let div of document.querySelectorAll(".sort_divs")) {
        div.style.background = "var(--md-sys-color-primary-container)";
        div.style.borderColor = "var(--md-sys-color-primary)";
        div.firstElementChild.style.color = "var(--md-sys-color-on-primary-container)";
        document.querySelectorAll(`#${div.id} > div > label`).forEach(function (item) {
            item.style.color = "var(--md-sys-color-on-primary-container)";
        });
        if (div.id !== onDiv.id) {
            for (let input of document.querySelectorAll(`#${div.id} > div > input`)) {
                input.checked = false;
            }
        }
    }
}

function onIfOffDirInputs(div) {
    let list = document.querySelectorAll(`#${div.id} > div > input`);
    for (let input of list) {
        if (input.checked) return;
    }
    list[0].checked = true;
}

function sortContent(content, sortType, dir) {
    let mn;
    if (dir === "up") {
        mn = 1;
    } else {
        mn = -1;
    }
    content.sort(function (a, b) {
        if (a[sortType] > b[sortType]) return 1 * mn;
        if (a[sortType] === b[sortType]) return 0;
        if (a[sortType] < b[sortType]) return -1 * mn;
    });
}

function onSortDivClickListener(div) {
    offSortDivs(div);
    onIfOffDirInputs(div);
    div.style.background = "var(--md-sys-color-secondary-container)";
    div.style.borderColor = "var(--md-sys-color-secondary)";
    div.firstElementChild.style.color = "var(--md-sys-color-on-secondary-container)";
    document.querySelectorAll(`#${div.id} > div > label`).forEach(function (item) {
        item.style.color = "var(--md-sys-color-on-tertiary-container)";
    });
    for (let input of document.querySelectorAll(`#${div.id} > div > input`)) {
        if (input.checked) {
            sortContent(content, input.id.split("_")[0], input.id.split("_")[2]);
        }
    }
    setContent(content);
}

for (let div of document.querySelectorAll(".sort_divs")) {
    div.addEventListener("click", function () {
        onSortDivClickListener(div);
    })
}

function getChoiceFilter(content, parameter, values) {
    if (values.length === 0) return content;
    return content.filter(function (item) {
        return values.includes(item[parameter]);
    });
}

function getFilterList(list, parameter, a, b) {
    if (!a || !b) return list;
    return list.filter(function (item) {
        let cost = Number(item[parameter]);
        return (cost >= a && cost <= b);
    });
}

window.addEventListener("scroll", function () {
    if (document.documentElement.getBoundingClientRect().bottom <= document.documentElement.clientHeight + 100 + document.querySelector("footer").offsetHeight) {
        addProducts(content);
    }
});

window.addEventListener("touchmove", function () {
    if (document.documentElement.getBoundingClientRect().bottom <= document.documentElement.clientHeight + 100 + document.querySelector("footer").offsetHeight) {
        addProducts(content)
    }
});


document.getElementById("confirm_filter_button").onclick = function () {
    content = data;

    let costFrom = Number(document.getElementById("from_cost_filter").value);
    let costTo = Number(document.getElementById("to_cost_filter").value);
    if (costFrom && costTo) {
        content = getFilterList(content, "cost", costFrom, costTo);
    }

    for (let fieldset of document.querySelectorAll("#filters_div > fieldset")) {
        let id = fieldset.id.split("_");
        if (id[1] === "choice") {
            let values = [];
            for (let input of document.querySelectorAll(`#${fieldset.id} > label > input`)) {
                if (input.checked) {
                    values.push(input.parentElement.textContent.replaceAll("\n", "").replaceAll("  ", ""));
                }
            }
            content = getChoiceFilter(content, id[0], values);
        } else if (id[1] === "num") {
            content = getFilterList(
                content,
                id[0],
                Number(document.getElementById(`${id[0]}_from_filter`).value),
                Number(document.getElementById(`${id[0]}_to_filter`).value)
            );
        }
    }
    setContent(content);
}
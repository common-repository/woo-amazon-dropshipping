var hostname = "https://wooshark.website";

function getImages(imagesBlock) {
    return imagesBlock;
}




function getItemSpecificfromTable(globalvariation, itemSpec) {
    var trs = itemSpec;
    var attributesFromVariations = globalvariation.NameValueList.map(function(
        item
    ) {
        return item.name;
    });

    if (trs && trs.length) {
        trs.forEach(function(item, index) {
            // _.each(trs, function(item, index) {
            if (index) {
                if (attributesFromVariations.indexOf(item.attrName) == -1) {
                    globalvariation.NameValueList.push({
                        name: item.attrName || "-",
                        visible: true,
                        variation: false,
                        value: [item.attrValue]
                    });
                }
            }
        });
    }
    return globalvariation;
}

function getCurrentTotalImportItemsValues() {
    var totalImportItems = localStorage.getItem("totalImportItems");
    if (totalImportItems) {
        return parseInt(totalImportItems);
    } else {
        return 1;
    }
}

function incrementAllowedImport() {
    var newValue = getCurrentTotalImportItemsValues() + 1;
    localStorage.setItem("totalImportItems", newValue);
    console.log("------ totel imported item", newValue);
    jQuery("#remaining").text("Imported products: " + newValue);
}


globalBulkCount = 0;

function handleServerResponse(responseCode, title, data) {
    // var responseWoocomerce = response.status;

    if (responseCode === 200) {
        try {
            incrementAllowedImport();
            displayToast("Product " + title + "  imported successfully", "green");
        } catch (e) {
            displayToast("exception during import", "red");
        }

        jQuery(".loader2").css({
            display: "none"
        });
    } else if (responseCode == 0) {
        // stopLoadingError();
        displayToast(
            "Error establishing connection to server This can be caused by 1- Firewall block or filtering 2- An installed browser extension is mucking things",
            "red"
        );

        jQuery(".loader2").css({
            display: "none"
        });
    } else if (responseCode == 500) {
        displayToast(
            "The server encountered an unexpected condition which prevented it from fulfilling the request, please try again or inform us by email wooebayimporter@gmail.com",
            "red"
        );
        jQuery(".loader2").css({
            display: "none"
        });
    } else if (responseCode == 413) {
        displayToast(
            "The server is refusing to process a request because the request entity is larger than the server is willing or able to process. The server MAY close the connection to prevent the client from continuing the request.",
            "red"
        );
        jQuery(".loader2").css({
            display: "none"
        });
    } else if (responseCode == 504) {
        displayToast(
            "Gateway Timeout Error, the server, acting as a gateway, timed out waiting for another server to respond",
            "red"
        );
        jQuery(".loader2").css({
            display: "none"
        });
    } else if (data) {
        displayToast(data, "red");
        jQuery(".loader2").css({
            display: "none"
        });
    } else {
        displayToast("Error while inserting the product", "red");
        jQuery(".loader2").css({
            display: "none"
        });
    }
}



function importProducts() {
    if (waitingListProducts && waitingListProducts.length) {
        // let clientKey = 'ck_35ff9ec9d8c298fbc3c9834304993826cafbddd4'
        // let clientSecretKey = 'cs_564d3f83d2feaf0b135a1d66a3b9cb8e72c6ec90'
        // let clientWebsite = 'https://wooproductimporter.fr '

        try {
            var website = jQuery("#website")
                .val()
                .trim();
            var key_client = jQuery("#key_client")
                .val()
                .trim();
            var sec_client = jQuery("#sec_client")
                .val()
                .trim();
        } catch {
            displayToast("Error while colleting connection details");
        }

        var statusCode;

        fetch(hostname + ":8002/wordpress", {
                headers: { "Content-Type": "application/json; charset=utf-8" },
                method: "POST",
                body: JSON.stringify({
                    aliExpressProduct: waitingListProducts[0],
                    isVariationImage: true,
                    isPublish: true,
                    clientWebsite: website,
                    clientKey: key_client,
                    clientSecretKey: sec_client,
                    isPluginWordpress: true
                })
            })
            .then(response => {
                statusCode = response.status;
                return response.json();
            })

        .then(contents => {
            jQuery(".importToS").each(function(item, element) {
                console.log("----- un - disabling");
                jQuery(element).attr("disabled", false);
            });

            handleServerResponse(
                statusCode,
                waitingListProducts[0].title,
                contents.data
            );
            // if(contents){

            //     try{

            //         // var jsonResponse = JSON.parse(contents)
            //         // console.log('----------------', jsonResponse.data)
            //         // handleServerResponse(contents, jsonResponse);
            //     }catch(e){
            //         displayToast('Error during information retrieval');
            //     }
            // }else{
            //     displayToast('Platform error, please contact wooshark support');
            // }
        })

        .catch(r => {
            jQuery(".importToS").each(function(item, element) {
                console.log("----- un - disabling");
                jQuery(element).attr("disabled", false);
            });
            displayToast("Cannot insert product into shop", "red");
            jQuery(".loader2").css({
                display: "none"
            });
        });
    }

    // var count = 1;
}



function getDescription(productId, callback) {
    var productUrl = 'https://aeproductsourcesite.alicdn.com/product/description/pc/v2/en_EN/desc.htm?productId=' + productId + '&key=Hf26e350fe48d45d3be4a05ec8e1ac9d2y.zip&token=4cc39c331004aa3153fe1623ffdc10c4'
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const url = productUrl; // site that doesn’t send Access-Control-*
    fetch(proxyurl + url) // https://cors-anywhere.herokuapp.com/https://example.com
        .then(response => response.text())
        .then(contents => {
            console.log('contents', response);
            callback(contents);
        })
        .catch(r => {
            callback(false);
            // console.log(" -- - -" + r);

        });
}

function getProductId(productUrl) {
    var indexStart = productUrl.indexOf(".html");
    var productIdSubstring = productUrl.substring(0, indexStart);
    var productId = productIdSubstring.match(/\d+/)[0];
    return productId;
}

jQuery(document).on("click", "#goToExtension", function(event) {
    window.open("https://www.wooshark.com/aliexpress-ebay-banggood-tmart");
});

jQuery(document).on("click", "#close-1", function(event) {
    // window.open('https://www.wooshark.com/aliexpress-ebay-banggood-tmart')

    jQuery("#section-1").hide();
});

jQuery(document).on("click", "#close-2", function(event) {
    // window.open('https://www.wooshark.com/aliexpress-ebay-banggood-tmart')

    jQuery("#section-2").hide();
});



function importProductGlobally(productId) {
    var website = jQuery("#website")
        .val()
        .trim();
    if (getCurrentTotalImportItemsValues() < 50 || (website && website.includes('http://188.213.28.18'))) {
        try {

            if (productId) {
                jQuery(this).attr("disabled", true);
                jQuery(".importToS").each(function(item, element) {
                    console.log("----- disabling");
                    jQuery(element).attr("disabled", true);
                });

                jQuery(".loader2").css({
                    display: "block",
                    position: "fixed",
                    "z-index": 9999,
                    top: "50px",
                    right: "50px",
                    "border-radius": "35px",
                    "background-color": "black"
                });
                getProductDetailsFromServer(productId, '-');
            }
        } catch (e) {
            jQuery(".importToS").each(function(item, element) {
                console.log("----- un - disabling 2");
                jQuery(element).attr("disabled", false);
            });
            displayToast(
                "cannot retrieve product id, please try again, if the issue persists, please contact wooebayimporter@gmail.com",
                "red"
            );
        }
    } else {
        jQuery(".importToS").each(function(item, element) {
            console.log("----- un - disabling");
            jQuery(element).attr("disabled", false);
        });
        jQuery(".loader2").css({
            display: "none"
        });

        displayToast(
            "You have reached the maximum number of products to import for this month using the free version. please upgrade to pro version",
            "red"
        );

        setTimeout(function() {
            window.open("https://www.wooshark.com/aliexpress-ebay-banggood-tmart");
        }, 3000);
    }
}
jQuery(document).on("click", "#importToShopBulk", function(event) {

    productId = jQuery(this)
        .parents(".card")
        .find("#sku")[0].innerText;

    if (productId) {
        importProductGlobally(productId);
    } else {
        displayToast("Cannot get product sku", "red");
    }

});

jQuery(document).on("click", ".product-page-item", function(event) {
    // window.open('https://www.wooshark.com/aliexpress-ebay-banggood-tmart')

    var pageNo = 1;

    try {
        pageNo = parseInt(jQuery(this)[0].innerText);
        getAllProducts(pageNo);
    } catch (e) {
        pageNo = 1;
        displayToast(
            "error while index selection, please contact wooshark, wooebayimporter@gmail.com",
            "red"
        );
    }
});

jQuery(document).on("click", ".page-item", function(event) {
    // window.open('https://www.wooshark.com/aliexpress-ebay-banggood-tmart')

    var pageNo = 1;

    try {
        pageNo = parseInt(jQuery(this)[0].innerText);
    } catch (e) {
        pageNo = 1;
        displayToast(
            "error while index selection, please contact wooshark, wooebayimporter@gmail.com",
            "red"
        );
    }

    searchProducts(pageNo);
});

function searchProducts(pageNo) {
    jQuery("#pagination").empty();
    jQuery("#pagination").show();
    jQuery("#product-search-container").empty();
    let searchKeyword = jQuery("#searchKeyword").val();
    var language = jQuery('input[name="language"]:checked')[0] ?
        jQuery('input[name="language"]:checked')[0].value :
        "en";

    if (searchKeyword) {
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                var responseWoocomerce = xmlhttp.status;
                if (responseWoocomerce === 200) {
                    try {
                        data = JSON.parse(xmlhttp.response).data;
                        console.log(data);

                        try {
                            var jsonData = JSON.parse(data);
                            var products = jsonData.result.products;

                            products.forEach(function(item) {
                                jQuery(
                                    '<div class="card text-center" style="flex: 1 1 20%; margin:30px; padding:50px">' +
                                    '  <div class="card-body">' +
                                    '<h5 class="card-title"> ' +
                                    item.productTitle.substring(0, 70) +
                                    "</h5>" +
                                    '<img src="' +
                                    item.imageUrl +
                                    '" width="150"  height="150"></img>' +
                                    '<div>Price: <p class="card-text" ">' +
                                    item.salePrice +
                                    "</div></p>" +
                                    'Sku: <p class="card-text" id="sku" ">' +
                                    item.productId +
                                    "</p>" +
                                    "<div>" +
                                    '<div><a  style="width:100%" id="importToShopBulk" class="importToS btn btn-primary">Import to shop</a></div>' +
                                    '<div><a target="_blank" style="width:100%; margin-top:5px" href="' +
                                    item.productUrl +
                                    '" class="btn btn-primary">Product url</a></div>' +
                                    "</div>" +
                                    "</div>" +
                                    "</div>"
                                ).appendTo("#product-search-container");
                            });

                            var numberOfPage = Math.round(jsonData.result.totalResults / 40);
                            if (numberOfPage > 12) {
                                numberOfPage = 12;
                            }
                            for (var i = 1; i < numberOfPage; i++) {
                                jQuery(
                                    ' <li id="page-' +
                                    i +
                                    '" class="page-item"><a class="page-link">' +
                                    i +
                                    "</a></li>"
                                ).appendTo("#pagination");
                            }
                        } catch (e) {
                            displayToast("Empty result for this search keyword", "red");
                        }

                        // var $data = jQuery(data)

                        // var indexStart = data.indexOf('window.runParams = {"') + 19;
                        // var indexEnd = data.indexOf('normal_result') + 15;
                        // var jsonContent = data.substring(indexStart, indexEnd);

                        // console.log('json content ', jsonContent)

                        // // console.log('json content ', jsonContent)
                        // var productsJSon = JSON.parse(jsonContent);
                        // console.log('json content ', productsJSon)
                        // var items = productsJSon.items;
                        // console.log('items ', items)

                        // var content = '';
                        // items.forEach(function(item) {
                        //     content = content + '<div width="150px" height="150px" style="border:1px solid black"><img src="' + item.imageUrl + '"></img></div>'
                        // });
                        // console.log(')-------', content);
                        // jQuery('#searchResult').append($(content));
                    } catch (e) {}
                }
            }
        };

        xmlhttp.open("POST", hostname + ":8002/seearchAliExpressProducts", true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(
            JSON.stringify({
                searchKeyword: searchKeyword,
                pageNo: pageNo,
                language: language
            })
        );
    } else {
        displayToast("Search keyword cannot be empty", "red");
    }
}
jQuery(document).on("click", "#seachProductsButton", function(event) {
    searchProducts(1);
});


jQuery(document).on("click", "#discoverFeatures", function(event) {
    if (jQuery("#discoverFeatureContent").is(":hidden")) {
        jQuery("#discoverFeatureContent").show();
    } else {
        jQuery("#discoverFeatureContent").hide();
    }
});

jQuery(document).on("click", "#displayConnectToStore", function(event) {
    if (jQuery("#connect-to-store").is(":hidden")) {
        jQuery("#connect-to-store").show();
    } else {
        jQuery("#connect-to-store").hide();
    }
});

jQuery(document).on("click", "#importProductToShopByUrl", function(event) {
    var productUrl = jQuery("#productUrl").val();

    // if (getCurrentTotalImportItemsValues() < 1000) {
    if (productUrl) {
        var productId = getProductId(productUrl);

        if (productId) {
            importProductGlobally(productId);
        } else {
            displayToast("Cannot get product sku", "red");
        }



    } else {
        jQuery(".importToS").each(function(item, element) {
            console.log("----- un - disabling");
            jQuery(element).attr("disabled", false);
        });
        jQuery(".loader2").css({
            display: "none"
        });

        displayToast(
            "You have reached the maximum number of product to import using the free version. please upgrade to pro version",
            "red"
        );

        setTimeout(function() {
            window.open("https://www.wooshark.com/aliexpress-ebay-banggood-tmart");
        }, 3000);
    }
});


jQuery(document).on("click", "#importProductToShopBySky", function(event) {
    var productId = jQuery("#productSku").val();

    if (productId) {
        importProductGlobally(productId);
    } else {
        displayToast("Cannot get product sku", "red");
    }
});

function save_options(website, key_client, sec_client) {
    if (website && key_client && sec_client) {
        localStorage.setItem("website", website);
        localStorage.setItem("key_client", key_client);
        localStorage.setItem("sec_client", sec_client);
    }
}

// document.addEventListener('DOMContentLoaded', restore_options);

jQuery(document).ready(function() {
    // jQuery(".not-connected").show();
    // jQuery("#connected").hide();
    jQuery('.nav-item a[id="pills-advanced-tab"]').html(
        jQuery('.nav-item a[id="pills-advanced-tab"]').text() +
        '<span   class="badge badge-light"> <i class="fas fa-star"></i> </span>'
    );

    jQuery("#remaining").text(
        "Imported products: " + localStorage.getItem("totalImportItems") || 1
    );

    restore_options();
});

function restore_options() {
    var website, key_client, sec_client;

    website = localStorage.getItem("website");
    key_client = localStorage.getItem("key_client");
    sec_client = localStorage.getItem("sec_client");

    document.getElementsByClassName("website")[0].value = website || "";
    document.getElementsByClassName("key_client")[0].value = key_client || "";
    document.getElementsByClassName("sec_client")[0].value = sec_client || "";
    if (website && key_client && sec_client) {
        connectToStore();
    } else {
        jQuery(".not-connected").show();
        jQuery("#connected").hide();

        jQuery('.nav-item a[id="pills-connect-tab"]').css({
            "background-color": "red"
        });
        jQuery('.nav-item a[id="pills-connect-tab"]').css({ color: "white" });
    }
}

function displayToast(data, color) {
    jQuery.toast({
        text: data,
        // It can be plain, fade or slide
        bgColor: "white", // Background color for toast
        textColor: color, // text color
        hideAfter: 5000,
        stack: 5, // `false` to show one stack at a time count showing the number of toasts that can be shown at once
        textAlign: "left", // Alignment of text i.e. left, right, center
        position: "bottom-right" // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values to position the toast on page
    });
}

function isNotConnected() {
    jQuery(".not-connected").show();
    jQuery("#connected").hide();
}

function connectToStore() {
    jQuery(".loader").css({
        display: "block",
        "background-color": "black"
    });

    var website = jQuery("#website")
        .val()
        .trim();
    var key_client = jQuery("#key_client")
        .val()
        .trim();
    var sec_client = jQuery("#sec_client")
        .val()
        .trim();

    save_options(website, key_client, sec_client);

    var xmlConnectToStore = new XMLHttpRequest();
    xmlConnectToStore.onreadystatechange = function() {
        if (xmlConnectToStore.readyState == 4) {
            // console.log(readBody(xmlConnect));
            var responseWoocomerce = xmlConnectToStore.status;
            if (responseWoocomerce === 200) {
                getCategories();
                jQuery(".loader").css({
                    display: "none"
                });
                jQuery('.nav-item a[id="pills-connect-tab"]').css({
                    "background-color": "green"
                });
                jQuery('.nav-item a[id="pills-connect-tab"]').css({ color: "white" });

                jQuery(".not-connected").hide();
                jQuery("#connected").show();

                displayToast("Connected successfully", "green");
                jQuery("#isConnectedArea").css("background-color", "green");

                getNumberOfPage(website, key_client, sec_client);
                // getCategories(website, key_client, sec_client);
            } else if (responseWoocomerce === 0) {
                isNotConnected();
                displayToast(
                    "Error establishing connection to host " +
                    website +
                    " This can be caused by 1- Firewall block or filtering 2- An installed browser extension is mucking things, disable other chrome extensions one by one and try again 3- Installed plugin that prevent the connection to your host (security plugins, cache plugins, etc..",
                    "red"
                );

                jQuery("#isConnectedArea").css("background-color", "red");

                jQuery(".loader").css({
                    display: "none"
                });
            } else {
                isNotConnected();
                jQuery("#isConnectedArea").css("background-color", "red");

                if (
                    xmlConnectToStore.response &&
                    xmlConnectToStore.response &&
                    xmlConnectToStore.response.length > 13
                ) {
                    try {
                        var data = JSON.parse(xmlConnect.response).data;
                        displayToast(
                            "Error establishing connection to host " + website + "  " + data,
                            "red"
                        );
                    } catch (e) {
                        displayToast(
                            "Error establishing connection to host " + website,
                            "red"
                        );
                    }
                } else {
                    displayToast(
                        "Error establishing connection to host " +
                        website +
                        " wordpress url is not valid",
                        "red"
                    );

                    jQuery(".loader").css({
                        display: "none"
                    });
                }

                jQuery(".loader").css({
                    display: "none"
                });
            }
        }
    };

    xmlConnectToStore.open("POST", hostname + ":8002/authentification", true);
    xmlConnectToStore.setRequestHeader("Content-Type", "application/json");

    xmlConnectToStore.send(
        JSON.stringify({
            premuimExtension: false,
            clientWebsite: website,
            clientKey: key_client,
            clientSecretKey: sec_client,
            isPluginWordpress: true
        })
    );
}

jQuery(document).on("click", "#connectToStore", function(event) {
    connectToStore();
});

var numberOfPageBy20 = 0;

function getNumberOfPage(clientWebsite, clientKey, clientSecretKey) {
    // startLoadingEffect();
    // productsToUpdate = [];
    var xmlhttpProduct = new XMLHttpRequest();
    xmlhttpProduct.onreadystatechange = function() {
        if (xmlhttpProduct.readyState == 4) {
            var responseWoocomerce = xmlhttpProduct.status;
            if (responseWoocomerce === 200) {
                var Jsondata = JSON.parse(xmlhttpProduct.response);
                numberOfPageBy20 = Jsondata.data;
                console.log("xxxxxxxxxxxxxxxxxxxx", numberOfPageBy20);
                getAllProducts(clientWebsite, clientKey, clientSecretKey, 1);
            } else {
                displayToast("Error while retrieving data from woocommerce", "red");
            }
        }
    };
    xmlhttpProduct.open("POST", hostname + ":8002/getNumberOfPages", true);
    xmlhttpProduct.setRequestHeader("Content-Type", "application/json");
    xmlhttpProduct.send(
        JSON.stringify({
            clientWebsite: clientWebsite,
            clientKey: clientKey,
            clientSecretKey: clientSecretKey
        })
    );
}

function getAllProducts(clientWebsite, clientKey, clientSecretKey, pageIndex) {
    var counterToUpdate = 0;
    var xhr = [];
    var percentageProgress = 0;
    var incrementPercentaage = 100 / numberOfPageBy20;
    var counter = numberOfPageBy20 + 1;

    var productsToUpdate = [];
    var xmlUpdateRequest = new XMLHttpRequest();
    xmlUpdateRequest.onreadystatechange = function() {
        if (this.readyState == 4) {
            var responseWoocomerce = this.status;

            if (responseWoocomerce === 200) {
                var Jsondata = JSON.parse(this.response);
                var data = Jsondata.data;
                if (data) {
                    // data.forEach(function(item) {
                    // productsToUpdate.push(item);
                    var table = jQuery("#products-wooshark");
                    table.find("tbody tr").remove();
                    data.forEach(function(item) {
                        counterToUpdate++;
                        var productUrl = item.meta_data.find(function(item) {
                            return item.key == "productUrl";
                        });
                        table.append(
                            "<tr>" +
                            "<td><img width='80px'  height='80px' src=" +
                            item.images[0].src +
                            "></img></td>" +
                            "<td>" +
                            item.sku +
                            "</td>" +
                            " <td>" +
                            item.name.substring(0, 50) +
                            "</td>" +
                            "<td>" +
                            item.salePrice +
                            "</td>" +
                            "<td><button class='btn btn-primary' ><a style='color:white' href=" +
                            productUrl.value +
                            "  target='_blank'> Original product url </a></button></td></tr>"
                        );
                    });

                    // var numberOfPage = Math.round(data.length / 20);
                    if (numberOfPageBy20 > 12) {
                        numberOfPageBy20 = 12;
                    }
                    for (var i = 2; i < numberOfPageBy20; i++) {
                        jQuery(
                            ' <li id="product-page-' +
                            i +
                            '" class="product-page-item"><a class="page-link">' +
                            i +
                            "</a></li>"
                        ).appendTo("#product-pagination");
                    }

                    jQuery('.nav-item a[id="pills-connect-products"]').html(
                        jQuery('.nav-item a[id="pills-connect-products"]').text() +
                        ('<span class="badge badge-light">' + counterToUpdate + "</span>")
                    );
                }
            } else {
                displayToast("error while retrieving products", "red");
            }
        }
    };
    xmlUpdateRequest.open(
        "POST",
        hostname + ":8002/getProductToupdateWordpressPlugin",
        true
    );
    xmlUpdateRequest.setRequestHeader("Content-Type", "application/json");
    xmlUpdateRequest.send(
        JSON.stringify({
            page: pageIndex,
            perPage: 20,
            clientWebsite: clientWebsite,
            clientKey: clientKey,
            clientSecretKey: clientSecretKey
        })
    );
    // }
}

function getProductDetailsFromServer(sku, description) {
    var xmlUpdateRequest = new XMLHttpRequest();
    xmlUpdateRequest.onreadystatechange = function() {
        if (this.readyState == 4) {
            var responseWoocomerce = this.status;

            if (responseWoocomerce === 200) {
                var Jsondata = JSON.parse(this.response);
                var data = Jsondata.data;
                if (data) {
                    // var aliExpressProduct = {
                    //     title: jsonParsed.title,
                    //     description: jsonParsed.description,
                    //     productUrl: jsonParsed.productUrl,
                    //     mainImage: jsonParsed.pic_url,
                    //     images: jsonParsed.item_imgs,
                    //     specifications: jsonParsed.props,
                    //     variations: getGlobalVariations(jsonParsed.skus.sku, yyyyy, xxxxx)

                    // };
                    var categories = [];
                    jQuery(".categories input:checked").each(function() {
                        categories.push(
                            jQuery(this)
                            .attr("value")
                            .trim()
                        );
                    });

                    var productCategoies = categories;

                    if (data.variations && data.variations.variations && data.variations.variations.length) {
                        var aliExpressProduct = {

                            title: data.title,
                            description: description,
                            images: data.images,
                            variations: data.variations,
                            productUrl: data.productUrl,
                            productCategoies: productCategoies,
                            importSalePrice: true,
                            simpleSku: sku.toString(),
                            featured: true




                        };
                    } else {
                        var aliExpressProduct = {

                            title: data.title,
                            description: data.description,
                            images: data.images,
                            variations: [],
                            productUrl: data.productUrl,
                            productCategoies: productCategoies,
                            importSalePrice: true,
                            simpleSku: sku.toString(),
                            featured: true,
                            currentPrice: data.salePrice,
                            originalPrice: data.regularPrice,
                            totalAvailQuantity: data.totalAvailQuantity
                        };
                    }


                    // jQuery(".waitingListClass").css({
                    //     display: "block"
                    // });

                    console.log("aliExpressProduct", aliExpressProduct);
                    waitingListProducts = [];
                    waitingListProducts.push(aliExpressProduct);
                    importProducts();
                    // })
                }
            } else {
                displayToast("error while retrieving products", "red");
            }
        }
    };
    xmlUpdateRequest.open(
        "POST",
        hostname + ":8002/getAliExpressProductDetailsFromServer",
        true
    );
    xmlUpdateRequest.setRequestHeader("Content-Type", "application/json");
    xmlUpdateRequest.send(
        JSON.stringify({
            sku: sku
        })
    );
}

// jQuery(document).on("click", "#select-category", function(event) {
//     if (jQuery(".categories").is(":hidden")) {
//         jQuery(".categories").show();
//         getCategories();
//     } else {
//         jQuery(".categories").hide();
//     }
// });

function getCategories(website, key_client, sec_client) {
    var website = jQuery("#website")
        .val()
        .trim();
    var key_client = jQuery("#key_client")
        .val()
        .trim();
    var sec_client = jQuery("#sec_client")
        .val()
        .trim();

    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            var responseWoocomerce = xmlhttp.status;
            if (responseWoocomerce === 200) {
                var savedCategories = JSON.parse(xmlhttp.response).data;

                jQuery(".categories").empty();
                jQuery.each(savedCategories, function(key, val) {
                    var items = "";
                    items =
                        '<div class="checkbox">' +
                        '<label><input id="category' +
                        val.id +
                        '" type="checkbox" class="chk" value="' +
                        val.id +
                        ' "/>' +
                        val.name +
                        "</label>";
                    (" </div>");
                    jQuery(".categories").append(jQuery(items));
                });
            }
        }
    };

    // xmlhttp.send(JSON.stringify({ clientWebsite: clientWebsite, clientKey: clientKey, clientSecretKey: clientSecretKey }));

    xmlhttp.open("POST", hostname + ":8002/categories", true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(
        JSON.stringify({
            clientWebsite: website,
            clientKey: key_client,
            clientSecretKey: sec_client
        })
    );
}



// var hostname = "https://wooshark.website";

// function getImages(imagesBlock) {
//     return imagesBlock;
// }

// function getVariations(skuModule, data) {
//     var globalvariation = {
//         variations: [],
//         NameValueList: []
//     };

//     if (skuModule.skuPriceList && skuModule.skuPriceList.length) {
//         skuModule.skuPriceList.forEach(function(element, index) {
//             // _.each(skuModule.skuPriceList, function(element, index) {
//             var salePrice =
//                 element.skuVal.actSkuMultiCurrencyCalPrice ||
//                 element.skuVal.actSkuCalPrice;
//             var regularPrice =
//                 element.skuVal.skuMultiCurrencyCalPrice || element.skuVal.skuCalPrice;
//             if (element.skuPropIds && index < 100) {
//                 var attributesIds = element.skuPropIds.split(",");
//                 globalvariation.variations.push({
//                     identifier: element.skuPropIds,
//                     SKU: element.skuId,
//                     availQuantity: element.skuVal.availQuantity,
//                     salePrice: salePrice,
//                     regularPrice: regularPrice,
//                     attributesVariations: getAttributesVariations(
//                         element.skuPropIds,
//                         skuModule.productSKUPropertyList
//                     )
//                 });
//             }
//         });
//     }

//     if (skuModule.skuPriceList && skuModule.skuPriceList[0]) {
//         globalvariation.NameValueList = buildNameListValues(
//             skuModule.productSKUPropertyList
//         );
//     }

//     return globalvariation;
// }

// function buildNameListValues(productSKUPropertyList) {
//     var attribuesNamesAndValues = [];
//     var attributes = jQuery("#j-product-info-sku").find("dt");
//     if (productSKUPropertyList && productSKUPropertyList.length) {
//         productSKUPropertyList.forEach(function(item, index) {
//             // _.each(productSKUPropertyList, function(item, index) {
//             var attributeValues = getAttrValues(item);
//             if (attributeValues && attributeValues.length) {
//                 attribuesNamesAndValues.push({
//                     name: item.skuPropertyName,
//                     value: attributeValues,
//                     variation: true,
//                     visible: true
//                 });
//             }
//         });
//     }

//     return attribuesNamesAndValues;
// }

// function getAttrValues(item) {
//     var values = [];
//     item.skuPropertyValues.forEach(function(item) {
//         // _.each(item.skuPropertyValues, function(item) {

//         values.push(item.propertyValueDisplayName);
//     });
//     console.log("values", values);
//     return values;
// }

// function getAttributesVariations(skuPropIds, productSKUPropertyList) {
//     var attributesVariations = [];
//     var attributesIds = skuPropIds.split(",");
//     for (var i = 0; i < attributesIds.length; i++) {
//         productSKUPropertyList.forEach(function(item) {
//             // _.each(productSKUPropertyList, function(item) {
//             item.skuPropertyValues.forEach(function(element) {
//                 // _.each(item.skuPropertyValues, function(element) {
//                 if (attributesIds[i] == element.propertyValueId) {
//                     attributesVariations.push({
//                         name: item.skuPropertyName,
//                         value: element.propertyValueDisplayName,
//                         image: element.skuPropertyImagePath
//                     });
//                 }
//             });
//         });
//     }
//     return attributesVariations;
// }

// function getItemSpecificfromTable(globalvariation, itemSpec) {
//     var trs = itemSpec;
//     var attributesFromVariations = globalvariation.NameValueList.map(function(
//         item
//     ) {
//         return item.name;
//     });

//     if (trs && trs.length) {
//         trs.forEach(function(item, index) {
//             // _.each(trs, function(item, index) {
//             if (index) {
//                 if (attributesFromVariations.indexOf(item.attrName) == -1) {
//                     globalvariation.NameValueList.push({
//                         name: item.attrName || "-",
//                         visible: true,
//                         variation: false,
//                         value: [item.attrValue]
//                     });
//                 }
//             }
//         });
//     }
//     return globalvariation;
// }

// function getCurrentTotalImportItemsValues() {
//     var totalImportItems = localStorage.getItem("totalImportItems");
//     if (totalImportItems) {
//         return parseInt(totalImportItems);
//     } else {
//         return 1;
//     }
// }

// function incrementAllowedImport() {
//     var newValue = getCurrentTotalImportItemsValues() + 1;
//     localStorage.setItem("totalImportItems", newValue);
//     console.log("------ totel imported item", newValue);
//     jQuery('#remaining').text('Imported products: ' + newValue);
// }

// function createAliexpressProduct(transitObject, isDirectimport) {
//     waitingListProducts = [];
//     var skuAttributes = "";
//     var images = [];
//     var descriptionUrl;
//     var attribObjArray;

//     images = getImages(transitObject.imageModule.imagePathList);

//     console.log("--------------2");

//     var variations = getVariations(transitObject.skuModule, transitObject.$data);
//     console.log("--------------3");

//     variations = getItemSpecificfromTable(
//         variations,
//         transitObject.specsModule.props
//     );

//     console.log("--------------4");

//     var originalPrice, totalAvailQuantity, salePrice;
//     if (transitObject.runParamObject.skuModule.skuPriceList.length == 1) {
//         // originalPrice = priceModule.skuVal.skuMultiCurrencyCalPrice || priceModule.skuVal.skuCalPrice;
//         totalAvailQuantity =
//             transitObject.runParamObject.quantityModule.totalAvailQuantity;
//         // salePrice = priceModule.skuVal.actSkuMultiCurrencyCalPrice || priceModule.skuVal.actSkuCalPrice;
//         originalPrice =
//             transitObject.runParamObject.skuModule.skuPriceList[0].skuVal
//             .skuMultiCurrencyCalPrice;
//         salePrice =
//             transitObject.runParamObject.skuModule.skuPriceList[0].skuVal
//             .actSkuMultiCurrencyCalPrice;
//     }

//     var categories = [];
//     jQuery('.categories input:checked').each(function() {
//         categories.push(jQuery(this).attr('value').trim());
//     });

//     var productCategoies = categories;



//     var aliExpressProduct = {
//         title: transitObject.title,
//         currentPrice: salePrice,
//         originalPrice: originalPrice,
//         description: transitObject.description,
//         images: images,
//         totalAvailQuantity: totalAvailQuantity || 1,
//         variations: variations,
//         productUrl: transitObject.productUrl,
//         reviews: transitObject.reviews,
//         productCategoies: productCategoies,
//         shortDescription: "",
//         weight: transitObject.weight,
//         importSalePrice: true,
//         inlcudeSkuAttribute: false,
//         simpleSku: transitObject.productId.toString(),
//         featured: true
//     };

//     jQuery(".waitingListClass").css({
//         display: "block"
//     });

//     console.log("aliExpressProduct", aliExpressProduct);

//     waitingListProducts.push(aliExpressProduct);
//     importProducts();
// }

// globalBulkCount = 0;

// function handleServerResponse(responseCode, title, data) {
//     // var responseWoocomerce = response.status;

//     if (responseCode === 200) {
//         try {
//             incrementAllowedImport();
//             displayToast("Product " + title + "  imported successfully", "green");
//         } catch (e) {
//             displayToast("exception during import", "red");
//         }

//         jQuery(".loader2").css({
//             display: "none"
//         });
//     } else if (responseCode == 0) {
//         // stopLoadingError();
//         displayToast(
//             "Error establishing connection to server This can be caused by 1- Firewall block or filtering 2- An installed browser extension is mucking things",
//             "red"
//         );

//         jQuery(".loader2").css({
//             display: "none"
//         });
//     } else if (responseCode == 500) {
//         displayToast(
//             "The server encountered an unexpected condition which prevented it from fulfilling the request, please try again or inform us by email wooebayimporter@gmail.com",
//             "red"
//         );
//         jQuery(".loader2").css({
//             display: "none"
//         });
//     } else if (responseCode == 413) {
//         displayToast(
//             "The server is refusing to process a request because the request entity is larger than the server is willing or able to process. The server MAY close the connection to prevent the client from continuing the request.",
//             "red"
//         );
//         jQuery(".loader2").css({
//             display: "none"
//         });
//     } else if (responseCode == 504) {
//         displayToast(
//             "Gateway Timeout Error, the server, acting as a gateway, timed out waiting for another server to respond",
//             "red"
//         );
//         jQuery(".loader2").css({
//             display: "none"
//         });
//     } else if (data) {
//         displayToast(data, "red");
//         jQuery(".loader2").css({
//             display: "none"
//         });
//     } else {
//         displayToast("Error while inserting the product", "red");
//         jQuery(".loader2").css({
//             display: "none"
//         });
//     }
// }

// let waitingListProducts = [];



// function importProducts() {
//     if (waitingListProducts && waitingListProducts.length) {
//         // let clientKey = 'ck_35ff9ec9d8c298fbc3c9834304993826cafbddd4'
//         // let clientSecretKey = 'cs_564d3f83d2feaf0b135a1d66a3b9cb8e72c6ec90'
//         // let clientWebsite = 'https://wooproductimporter.fr '

//         try {
//             var website = jQuery("#website")
//                 .val()
//                 .trim();
//             var key_client = jQuery("#key_client")
//                 .val()
//                 .trim();
//             var sec_client = jQuery("#sec_client")
//                 .val()
//                 .trim();
//         } catch {
//             displayToast("Error while colleting connection details");
//         }

//         var statusCode;

//         fetch(hostname + ":8002/wordpress", {
//                 headers: { "Content-Type": "application/json; charset=utf-8" },
//                 method: "POST",
//                 body: JSON.stringify({
//                     aliExpressProduct: waitingListProducts[0],
//                     isVariationImage: true,
//                     isPublish: true,
//                     clientWebsite: website,
//                     clientKey: key_client,
//                     clientSecretKey: sec_client,
//                     isPluginWordpress: true
//                 })
//             })
//             .then(response => {
//                 statusCode = response.status;
//                 return response.json();
//             })

//         .then(contents => {
//             jQuery(".importToS").each(function(item, element) {
//                 console.log("----- un - disabling");
//                 jQuery(element).attr("disabled", false);
//             });

//             handleServerResponse(
//                 statusCode,
//                 waitingListProducts[0].title,
//                 contents.data
//             );
//             // if(contents){

//             //     try{

//             //         // var jsonResponse = JSON.parse(contents)
//             //         // console.log('----------------', jsonResponse.data)
//             //         // handleServerResponse(contents, jsonResponse);
//             //     }catch(e){
//             //         displayToast('Error during information retrieval');
//             //     }
//             // }else{
//             //     displayToast('Platform error, please contact wooshark support');
//             // }
//         })

//         .catch(r => {
//             jQuery(".importToS").each(function(item, element) {
//                 console.log("----- un - disabling");
//                 jQuery(element).attr("disabled", false);
//             });
//             displayToast("Cannot insert product into shop", "red");
//             jQuery(".loader2").css({
//                 display: "none"
//             });
//         });
//     }

//     // var count = 1;
// }

// // function myFunction() {
// //     // alert('hhhhh')
// //     var $iframe = jQuery('#myiframe');
// //     if ( $iframe.length ) {
// //         $iframe.attr('src',url);
// //         return false;
// //     }
// //     return true;
// //   }

// function prepareProductDetails($data, data, productId, productUrl, reviews) {
//     var scripts = $data.find("script");
//     var itemSpec = $data.find(".property-item");

//     var descriptionUrls = data.match(
//         /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim
//     );

//     var descriptionUrl = descriptionUrls.find(function(item) {
//         return item.includes("aeproductsourcesite.alicdn.com");
//     });

//     var runParamsStart = data.indexOf("commonModule");
//     var runParamsEnd = data.indexOf("csrfToken");
//     var runParam = data
//         .substring(runParamsStart - 2, runParamsEnd)
//         .replace(",", "{");
//     runParam = runParam.trim();
//     runParam = runParam.substring(0, runParam.length - 1);

//     try {
//         var runParamObject = JSON.parse(runParam);

//         if (runParamObject) {
//             var skuModule = runParamObject.skuModule;
//             var title = runParamObject.titleModule.subject;

//             var finalDescription = getDescription(descriptionUrl, function(
//                 description
//             ) {
//                 var transitObject1 = {
//                     scripts: scripts,
//                     $data: $data,
//                     itemSpec: itemSpec,
//                     title: title,
//                     description: description || "",
//                     productUrl: productUrl,
//                     reviews: reviews,
//                     productId: productId,
//                     skuModule: skuModule,
//                     specsModule: runParamObject.specsModule,
//                     imageModule: runParamObject.imageModule,
//                     runParamObject: runParamObject
//                 };
//                 createAliexpressProduct(transitObject1, false);
//             });
//         }
//     } catch {
//         displayToast("need Aliexpress website verification", "red");
//         jQuery(".loader2").css({
//             display: "none"
//         });
//         setTimeout(function() {
//             var win = window.open(productUrl, "_blank");
//             win.focus();
//         }, 2000);
//     }
// }

// function getDescription(productUrl, callback) {
//     const proxyurl = "https://cors-anywhere.herokuapp.com/";
//     const url = productUrl; // site that doesn’t send Access-Control-*
//     fetch(proxyurl + url) // https://cors-anywhere.herokuapp.com/https://example.com
//         .then(response => response.text())
//         .then(contents => {
//             callback(contents);
//         })
//         .catch(r => console.log(" -- - -" + r));
// }

// function getProductId(productUrl) {
//     var indexStart = productUrl.indexOf(".html");
//     var productIdSubstring = productUrl.substring(0, indexStart);
//     var productId = productIdSubstring.match(/\d+/)[0];
//     return productId;
// }

// // function myFunctionSku(){
// //     var productId = jQuery('#productSku').val()
// //     var productUrl = 'https://aliexpress-ebay-banggood-tmart.com/item/' + productId + '.html';
// //     jQuery('iframe').attr({'src':productUrl})
// //     jQuery('iframe').show();
// // }

// // function myFunctionUrl(){
// //     var productUrl = jQuery('#productUrl').text()
// //     jQuery('iframe').attr({'src':productUrl})
// //     jQuery('iframe').show();
// // }

// jQuery(document).on("click", "#goToExtension", function(event) {
//     window.open("https://www.wooshark.com/aliexpress-ebay-banggood-tmart");
// });

// jQuery(document).on("click", "#close-1", function(event) {
//     // window.open('https://www.wooshark.com/aliexpress-ebay-banggood-tmart')

//     jQuery("#section-1").hide();
// });

// jQuery(document).on("click", "#close-2", function(event) {
//     // window.open('https://www.wooshark.com/aliexpress-ebay-banggood-tmart')

//     jQuery("#section-2").hide();
// });

// jQuery(document).on("click", "#importToShopBulk", function(event) {
//     if (getCurrentTotalImportItemsValues() < 36) {
//         var productId = "";
//         try {
//             productId = jQuery(this)
//                 .parents(".card")
//                 .find("#sku")[0].innerText;

//             console.log("------", productId);
//             if (productId) {
//                 jQuery(this).attr("disabled", true);
//                 jQuery(".importToS").each(function(item, element) {
//                     console.log("----- disabling");
//                     jQuery(element).attr("disabled", true);
//                 });
//                 // getProductDetailsFromServer(productId);

//                 importBySku(productId);
//             }
//         } catch (e) {
//             jQuery(".importToS").each(function(item, element) {
//                 console.log("----- un - disabling 2");
//                 jQuery(element).attr("disabled", false);
//             });
//             displayToast(
//                 "cannot retrieve product id, please try again, if the issue persists, please contact wooebayimporter@gmail.com",
//                 "red"
//             );
//         }
//     } else {
//         jQuery(".importToS").each(function(item, element) {
//             console.log("----- un - disabling");
//             jQuery(element).attr("disabled", false);
//         });
//         jQuery(".loader2").css({
//             display: "none"
//         });

//         displayToast(
//             "You have reached the maximum number of products to import for this month using the free version. please upgrade to pro version",
//             "red"
//         );

//         setTimeout(function() {
//             window.open('https://www.wooshark.com/aliexpress-ebay-banggood-tmart')
//         }, 3000);


//     }
// });

// jQuery(document).on("click", ".product-page-item", function(event) {
//     // window.open('https://www.wooshark.com/aliexpress-ebay-banggood-tmart')

//     var pageNo = 1;

//     try {
//         pageNo = parseInt(jQuery(this)[0].innerText);
//         getAllProducts(pageNo);
//     } catch (e) {
//         pageNo = 1;
//         displayToast(
//             "error while index selection, please contact wooshark, wooebayimporter@gmail.com",
//             "red"
//         );
//     }
// });

// jQuery(document).on("click", ".page-item", function(event) {
//     // window.open('https://www.wooshark.com/aliexpress-ebay-banggood-tmart')

//     var pageNo = 1;

//     try {
//         pageNo = parseInt(jQuery(this)[0].innerText);
//     } catch (e) {
//         pageNo = 1;
//         displayToast(
//             "error while index selection, please contact wooshark, wooebayimporter@gmail.com",
//             "red"
//         );
//     }

//     searchProducts(pageNo);
// });

// function searchProducts(pageNo) {
//     jQuery("#pagination").empty();
//     jQuery("#pagination").show();
//     jQuery("#product-search-container").empty();
//     let searchKeyword = jQuery("#searchKeyword").val();
//     var language = jQuery('input[name="language"]:checked')[0] ?
//         jQuery('input[name="language"]:checked')[0].value :
//         "en";

//     if (searchKeyword) {
//         xmlhttp = new XMLHttpRequest();
//         xmlhttp.onreadystatechange = function() {
//             if (xmlhttp.readyState == 4) {
//                 var responseWoocomerce = xmlhttp.status;
//                 if (responseWoocomerce === 200) {
//                     try {
//                         data = JSON.parse(xmlhttp.response).data;
//                         console.log(data);

//                         try {
//                             var jsonData = JSON.parse(data);
//                             var products = jsonData.result.products;

//                             products.forEach(function(item) {
//                                 jQuery(
//                                     '<div class="card text-center" style="flex: 1 1 20%; margin:30px; padding:50px">' +
//                                     '  <div class="card-body">' +
//                                     '<h5 class="card-title"> ' +
//                                     item.productTitle.substring(0, 70) +
//                                     "</h5>" +
//                                     '<img src="' +
//                                     item.imageUrl +
//                                     '" width="150"  height="150"></img>' +
//                                     '<div>Price: <p class="card-text" ">' +
//                                     item.salePrice +
//                                     "</div></p>" +
//                                     'Sku: <p class="card-text" id="sku" ">' +
//                                     item.productId +
//                                     "</p>" +
//                                     "<div>" +
//                                     '<div><a  style="width:100%" id="importToShopBulk" class="importToS btn btn-primary">Import to shop</a></div>' +
//                                     '<div><a target="_blank" style="width:100%; margin-top:5px" href="' +
//                                     item.productUrl +
//                                     '" class="btn btn-primary">Product url</a></div>' +
//                                     "</div>" +
//                                     "</div>" +
//                                     "</div>"
//                                 ).appendTo("#product-search-container");
//                             });

//                             var numberOfPage = Math.round(jsonData.result.totalResults / 40);
//                             if (numberOfPage > 12) {
//                                 numberOfPage = 12;
//                             }
//                             for (var i = 1; i < numberOfPage; i++) {
//                                 jQuery(
//                                     ' <li id="page-' +
//                                     i +
//                                     '" class="page-item"><a class="page-link">' +
//                                     i +
//                                     "</a></li>"
//                                 ).appendTo("#pagination");
//                             }
//                         } catch (e) {
//                             displayToast("Empty result for this search keyword", "red");
//                         }

//                         // var $data = jQuery(data)

//                         // var indexStart = data.indexOf('window.runParams = {"') + 19;
//                         // var indexEnd = data.indexOf('normal_result') + 15;
//                         // var jsonContent = data.substring(indexStart, indexEnd);

//                         // console.log('json content ', jsonContent)

//                         // // console.log('json content ', jsonContent)
//                         // var productsJSon = JSON.parse(jsonContent);
//                         // console.log('json content ', productsJSon)
//                         // var items = productsJSon.items;
//                         // console.log('items ', items)

//                         // var content = '';
//                         // items.forEach(function(item) {
//                         //     content = content + '<div width="150px" height="150px" style="border:1px solid black"><img src="' + item.imageUrl + '"></img></div>'
//                         // });
//                         // console.log(')-------', content);
//                         // jQuery('#searchResult').append($(content));
//                     } catch (e) {}
//                 }
//             }
//         };

//         xmlhttp.open("POST", hostname + ":8002/seearchAliExpressProducts", true);
//         xmlhttp.setRequestHeader("Content-Type", "application/json");
//         xmlhttp.send(
//             JSON.stringify({
//                 searchKeyword: searchKeyword,
//                 pageNo: pageNo,
//                 language: language
//             })
//         );
//     } else {
//         displayToast("Search keyword cannot be empty", "red");
//     }
// }
// jQuery(document).on("click", "#seachProductsButton", function(event) {
//     searchProducts(1);
// });

// //         // fetch(productUrl) // https://cors-anywhere.herokuapp.com/https://example.com
// //         //     .then(response => response.text())
// //         //     .then(contents => {
// //         //

// //         //     })
// //         //     .catch(() => {
// //         //         console.log("Can’t access " + productUrl + " response. Blocked by browser?")
// //         //         jQuery('.loader2').css({
// //         //             "display": "none"
// //         //         });
// //         //         displayToast('Error while getting search result', 'red');
// //         //     })

// //     } else {
// //         displayToast('search value is mandatory', 'red');
// //     }
// // });

// jQuery(document).on("click", "#discoverFeatures", function(event) {
//     if (jQuery("#discoverFeatureContent").is(":hidden")) {
//         jQuery("#discoverFeatureContent").show();
//     } else {
//         jQuery("#discoverFeatureContent").hide();
//     }
// });

// jQuery(document).on("click", "#displayConnectToStore", function(event) {
//     if (jQuery("#connect-to-store").is(":hidden")) {
//         jQuery("#connect-to-store").show();
//     } else {
//         jQuery("#connect-to-store").hide();
//     }
// });

// jQuery(document).on("click", "#importProductToShopByUrl", function(event) {
//     var productUrl = jQuery("#productUrl").val();

//     if (getCurrentTotalImportItemsValues() < 36) {
//         if (productUrl) {
//             jQuery(".loader2").css({
//                 display: "block",
//                 position: "fixed",
//                 "z-index": 9999,
//                 top: "50px",
//                 right: "50px",
//                 "border-radius": "35px",
//                 "background-color": "black"
//             });
//             var productId = getProductId(productUrl);

//             const proxyurl = "https://cors-anywhere.herokuapp.com/";
//             const url = productUrl; // site that doesn’t send Access-Control-*
//             fetch(proxyurl + url) // https://cors-anywhere.herokuapp.com/https://example.com
//                 .then(response => response.text())
//                 .then(contents => {
//                     console.log(contents);
//                     var $data = jQuery(contents);

//                     prepareProductDetails($data, contents, productId, productUrl, []);
//                 })
//                 .catch(() => {
//                     console.log("Can’t access " + url + " response. Blocked by browser?");
//                     jQuery(".loader2").css({
//                         display: "none"
//                     });
//                 });
//         } else {
//             displayToast("Error while getting Url", "red");
//         }
//     } else {
//         jQuery(".importToS").each(function(item, element) {
//             console.log("----- un - disabling");
//             jQuery(element).attr("disabled", false);
//         });
//         jQuery(".loader2").css({
//             display: "none"
//         });

//         displayToast(
//             "You have reached the maximum number of product to import using the free version. please upgrade to pro version",
//             "red"
//         );

//         setTimeout(function() {
//             window.open('https://www.wooshark.com/aliexpress-ebay-banggood-tmart')
//         }, 3000);

//     }
// });

// function importBySku(productId) {
//     if (getCurrentTotalImportItemsValues() < 36) {
//         jQuery(".loader2").css({
//             display: "block",
//             position: "fixed",
//             "z-index": 9999,
//             top: "50px",
//             right: "50px",
//             "border-radius": "35px",
//             "background-color": "black"
//         });

//         var myHeaders = new Headers();
//         myHeaders.append("Access-Control-Allow-Origin", "*");

//         var myInit = {
//             method: "GET",
//             headers: myHeaders
//         };

//         var productUrl = "https://aliexpress-ebay-banggood-tmart.com/item/" + productId + ".html";

//         // var xmlhttp = new XMLHttpRequest();
//         // xmlhttp.onreadystatechange = function() {
//         //     if (xmlhttp.readyState == 4) {
//         //         var responseWoocomerce = xmlhttp.status;

//         //         if (responseWoocomerce === 200) {
//         //             var data = JSON.parse(xmlhttp.response).data;
//         //             var serverUrl = JSON.parse(xmlhttp.response).reviewsUrl;
//         //             var $data = jQuery(data);
//         //             prepareProductDetails($data, data, productId, productUrl, []);
//         //         }
//         //     }
//         // };

//         // // xmlhttp.timeout = 7000; // time in milliseconds
//         // xmlhttp.open("POST", hostname + ":8002/reviewsUrl", true);
//         // xmlhttp.setRequestHeader("Content-Type", "application/json");
//         // xmlhttp.send(
//         //     JSON.stringify({ reviewsUrl: productUrl, productId: productId })
//         // );

//         const proxyurl = "https://cors-anywhere.herokuapp.com/";
//         const url = productUrl; // site that doesn’t send Access-Control-*
//         fetch(proxyurl + url, myInit) // https://cors-anywhere.herokuapp.com/https://example.com
//             .then(response => response.text())
//             .then(contents => {
//                 console.log(contents);
//                 var $data = jQuery(contents);

//                 prepareProductDetails($data, contents, productId, productUrl, []);
//             })
//             .catch(() => {
//                 console.log("Can’t access " + url + " response. Blocked by browser?");
//                 jQuery(".loader2").css({
//                     display: "none"
//                 });
//             });
//     } else {
//         jQuery(".importToS").each(function(item, element) {
//             console.log("----- un - disabling");
//             jQuery(element).attr("disabled", false);
//         });
//         jQuery(".loader2").css({
//             display: "none"
//         });

//         displayToast(
//             "You have reached the maximum number of product to import using the free version. please upgrade to pro version",
//             "red"
//         );
//         setTimeout(function() {
//             window.open('https://www.wooshark.com/aliexpress-ebay-banggood-tmart')
//         }, 3000);
//     }
// }
// jQuery(document).on("click", "#importProductToShopBySky", function(event) {
//     var productId = jQuery("#productSku").val();

//     if (productId) {
//         importBySku(productId);
//     } else {
//         displayToast("Cannot get product sku", "red");
//     }
// });

// function save_options(website, key_client, sec_client) {
//     if (website && key_client && sec_client) {
//         localStorage.setItem("website", website);
//         localStorage.setItem("key_client", key_client);
//         localStorage.setItem("sec_client", sec_client);
//     }
// }

// // document.addEventListener('DOMContentLoaded', restore_options);

// jQuery(document).ready(function() {
//     // jQuery(".not-connected").show();
//     // jQuery("#connected").hide();
//     jQuery('.nav-item a[id="pills-advanced-tab"]').html(
//         jQuery('.nav-item a[id="pills-advanced-tab"]').text() +
//         '<span   class="badge badge-light"> <i class="fas fa-star"></i> </span>'
//     );

//     jQuery('#remaining').text('Imported products: ' + localStorage.getItem('totalImportItems') || 1);

//     restore_options();
// });

// function restore_options() {
//     var website, key_client, sec_client;

//     website = localStorage.getItem("website");
//     key_client = localStorage.getItem("key_client");
//     sec_client = localStorage.getItem("sec_client");

//     document.getElementsByClassName("website")[0].value = website || "";
//     document.getElementsByClassName("key_client")[0].value = key_client || "";
//     document.getElementsByClassName("sec_client")[0].value = sec_client || "";
//     if (website && key_client && sec_client) {
//         connectToStore();
//     } else {
//         jQuery(".not-connected").show();
//         jQuery("#connected").hide();

//         jQuery('.nav-item a[id="pills-connect-tab"]').css({
//             "background-color": "red"
//         });
//         jQuery('.nav-item a[id="pills-connect-tab"]').css({ color: "white" });
//     }
// }

// function displayToast(data, color) {
//     jQuery.toast({
//         text: data,
//         // It can be plain, fade or slide
//         bgColor: "white", // Background color for toast
//         textColor: color, // text color
//         hideAfter: 5000,
//         stack: 5, // `false` to show one stack at a time count showing the number of toasts that can be shown at once
//         textAlign: "left", // Alignment of text i.e. left, right, center
//         position: "bottom-right" // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values to position the toast on page
//     });
// }

// function isNotConnected() {
//     jQuery(".not-connected").show();
//     jQuery("#connected").hide();
// }

// function connectToStore() {
//     jQuery(".loader").css({
//         display: "block",
//         "background-color": "black"
//     });

//     var website = jQuery("#website")
//         .val()
//         .trim();
//     var key_client = jQuery("#key_client")
//         .val()
//         .trim();
//     var sec_client = jQuery("#sec_client")
//         .val()
//         .trim();

//     save_options(website, key_client, sec_client);

//     var xmlConnectToStore = new XMLHttpRequest();
//     xmlConnectToStore.onreadystatechange = function() {
//         if (xmlConnectToStore.readyState == 4) {
//             // console.log(readBody(xmlConnect));
//             var responseWoocomerce = xmlConnectToStore.status;
//             if (responseWoocomerce === 200) {
//                 jQuery(".loader").css({
//                     display: "none"
//                 });
//                 jQuery('.nav-item a[id="pills-connect-tab"]').css({
//                     "background-color": "green"
//                 });
//                 jQuery('.nav-item a[id="pills-connect-tab"]').css({ color: "white" });

//                 jQuery(".not-connected").hide();
//                 jQuery("#connected").show();

//                 displayToast("Connected successfully", "green");
//                 jQuery("#isConnectedArea").css("background-color", "green");

//                 getNumberOfPage(website, key_client, sec_client);
//                 // getCategories(website, key_client, sec_client);
//             } else if (responseWoocomerce === 0) {
//                 isNotConnected();
//                 displayToast(
//                     "Error establishing connection to host " +
//                     website +
//                     " This can be caused by 1- Firewall block or filtering 2- An installed browser extension is mucking things, disable other chrome extensions one by one and try again 3- Installed plugin that prevent the connection to your host (security plugins, cache plugins, etc..",
//                     "red"
//                 );

//                 jQuery("#isConnectedArea").css("background-color", "red");

//                 jQuery(".loader").css({
//                     display: "none"
//                 });
//             } else {
//                 isNotConnected();
//                 jQuery("#isConnectedArea").css("background-color", "red");

//                 if (
//                     xmlConnectToStore.response &&
//                     xmlConnectToStore.response &&
//                     xmlConnectToStore.response.length > 13
//                 ) {
//                     try {
//                         var data = JSON.parse(xmlConnect.response).data;
//                         displayToast(
//                             "Error establishing connection to host " + website + "  " + data,
//                             "red"
//                         );
//                     } catch (e) {
//                         displayToast(
//                             "Error establishing connection to host " + website,
//                             "red"
//                         );
//                     }
//                 } else {
//                     displayToast(
//                         "Error establishing connection to host " +
//                         website +
//                         " wordpress url is not valid",
//                         "red"
//                     );

//                     jQuery(".loader").css({
//                         display: "none"
//                     });
//                 }

//                 jQuery(".loader").css({
//                     display: "none"
//                 });
//             }
//         }
//     };

//     xmlConnectToStore.open("POST", hostname + ":8002/authentification", true);
//     xmlConnectToStore.setRequestHeader("Content-Type", "application/json");

//     xmlConnectToStore.send(
//         JSON.stringify({
//             premuimExtension: false,
//             clientWebsite: website,
//             clientKey: key_client,
//             clientSecretKey: sec_client,
//             isPluginWordpress: true
//         })
//     );
// }

// jQuery(document).on("click", "#connectToStore", function(event) {
//     connectToStore();
// });

// var numberOfPageBy20 = 0;

// function getNumberOfPage(clientWebsite, clientKey, clientSecretKey) {
//     // startLoadingEffect();
//     // productsToUpdate = [];
//     var xmlhttpProduct = new XMLHttpRequest();
//     xmlhttpProduct.onreadystatechange = function() {
//         if (xmlhttpProduct.readyState == 4) {
//             var responseWoocomerce = xmlhttpProduct.status;
//             if (responseWoocomerce === 200) {
//                 var Jsondata = JSON.parse(xmlhttpProduct.response);
//                 numberOfPageBy20 = Jsondata.data;
//                 console.log("xxxxxxxxxxxxxxxxxxxx", numberOfPageBy20);
//                 getAllProducts(clientWebsite, clientKey, clientSecretKey, 1);
//             } else {
//                 displayToast("Error while retrieving data from woocommerce", "red");
//             }
//         }
//     };
//     xmlhttpProduct.open("POST", hostname + ":8002/getNumberOfPages", true);
//     xmlhttpProduct.setRequestHeader("Content-Type", "application/json");
//     xmlhttpProduct.send(
//         JSON.stringify({
//             clientWebsite: clientWebsite,
//             clientKey: clientKey,
//             clientSecretKey: clientSecretKey
//         })
//     );
// }

// function getAllProducts(clientWebsite, clientKey, clientSecretKey, pageIndex) {
//     var counterToUpdate = 0;
//     var xhr = [];
//     var percentageProgress = 0;
//     var incrementPercentaage = 100 / numberOfPageBy20;
//     var counter = numberOfPageBy20 + 1;

//     var productsToUpdate = [];
//     var xmlUpdateRequest = new XMLHttpRequest();
//     xmlUpdateRequest.onreadystatechange = function() {
//         if (this.readyState == 4) {
//             var responseWoocomerce = this.status;

//             if (responseWoocomerce === 200) {
//                 var Jsondata = JSON.parse(this.response);
//                 var data = Jsondata.data;
//                 if (data) {
//                     // data.forEach(function(item) {
//                     // productsToUpdate.push(item);
//                     var table = jQuery("#products-wooshark");
//                     table.find("tbody tr").remove();
//                     data.forEach(function(item) {
//                         counterToUpdate++;
//                         var productUrl = item.meta_data.find(function(item) {
//                             return item.key == "productUrl";
//                         });
//                         table.append(
//                             "<tr>" +
//                             "<td><img width='80px'  height='80px' src=" +
//                             item.images[0].src +
//                             "></img></td>" +
//                             "<td>" +
//                             item.sku +
//                             "</td>" +
//                             " <td>" +
//                             item.name.substring(0, 50) +
//                             "</td>" +
//                             "<td>" +
//                             item.salePrice +
//                             "</td>" +
//                             "<td><button class='btn btn-primary' ><a style='color:white' href=" +
//                             productUrl.value +
//                             "  target='_blank'> Original product url </a></button></td></tr>"
//                         );
//                     });

//                     // var numberOfPage = Math.round(data.length / 20);
//                     if (numberOfPageBy20 > 12) {
//                         numberOfPageBy20 = 12;
//                     }
//                     for (var i = 2; i < numberOfPageBy20; i++) {
//                         jQuery(
//                             ' <li id="product-page-' +
//                             i +
//                             '" class="product-page-item"><a class="page-link">' +
//                             i +
//                             "</a></li>"
//                         ).appendTo("#product-pagination");
//                     }

//                     jQuery('.nav-item a[id="pills-connect-products"]').html(
//                         jQuery('.nav-item a[id="pills-connect-products"]').text() +
//                         ('<span class="badge badge-light">' + counterToUpdate + "</span>")
//                     );
//                 }
//             } else {
//                 displayToast("error while retrieving products", "red");
//             }
//         }
//     };
//     xmlUpdateRequest.open(
//         "POST",
//         hostname + ":8002/getProductToupdateWordpressPlugin",
//         true
//     );
//     xmlUpdateRequest.setRequestHeader("Content-Type", "application/json");
//     xmlUpdateRequest.send(
//         JSON.stringify({
//             page: pageIndex,
//             perPage: 20,
//             clientWebsite: clientWebsite,
//             clientKey: clientKey,
//             clientSecretKey: clientSecretKey
//         })
//     );
//     // }
// }

// function getProductDetailsFromServer(sku) {
//     var xmlUpdateRequest = new XMLHttpRequest();
//     xmlUpdateRequest.onreadystatechange = function() {
//         if (this.readyState == 4) {
//             var responseWoocomerce = this.status;

//             if (responseWoocomerce === 200) {
//                 var Jsondata = JSON.parse(this.response);
//                 var data = Jsondata.data;
//                 if (data) {}
//             } else {
//                 displayToast("error while retrieving products", "red");
//             }
//         }
//     };
//     xmlUpdateRequest.open(
//         "POST",
//         hostname + ":8002/getAliExpressProductDetailsFromServer",
//         true
//     );
//     xmlUpdateRequest.setRequestHeader("Content-Type", "application/json");
//     xmlUpdateRequest.send(
//         JSON.stringify({
//             sku: sku
//         })
//     );
// }


// jQuery(document).on("click", "#select-category", function(event) {
//     if (jQuery(".categories").is(":hidden")) {
//         jQuery(".categories").show();
//         getCategories();
//     } else {
//         jQuery(".categories").hide();
//     }
// });


// function getCategories(website, key_client, sec_client) {

//     var website = jQuery("#website")
//         .val()
//         .trim();
//     var key_client = jQuery("#key_client")
//         .val()
//         .trim();
//     var sec_client = jQuery("#sec_client")
//         .val()
//         .trim();



//     xmlhttp = new XMLHttpRequest();
//     xmlhttp.onreadystatechange = function() {
//         if (xmlhttp.readyState == 4) {
//             var responseWoocomerce = xmlhttp.status;
//             if (responseWoocomerce === 200) {
//                 var savedCategories = JSON.parse(xmlhttp.response).data;


//                 jQuery('.categories').empty();
//                 jQuery.each(savedCategories, function(key, val) {
//                     var items = '';
//                     items = '<div class="checkbox">' +
//                         '<label><input id="category' + val.id + '" type="checkbox" class="chk" value="' + val.id + ' "/>' + val.name + '</label>'
//                     ' </div>';
//                     jQuery('.categories').append(jQuery(items))
//                 });

//             }
//         }
//     }

//     // xmlhttp.send(JSON.stringify({ clientWebsite: clientWebsite, clientKey: clientKey, clientSecretKey: clientSecretKey }));

//     xmlhttp.open("POST", hostname + ":8002/categories", true);
//     xmlhttp.setRequestHeader("Content-Type", "application/json");
//     xmlhttp.send(JSON.stringify({ clientWebsite: website, clientKey: key_client, clientSecretKey: sec_client }));
// }
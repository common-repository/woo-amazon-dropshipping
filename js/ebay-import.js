var hostname = "https://wooshark.website";

function getProductDetailsFromServerEbay(productId, callback) {
    var xmlhttpVariations = new XMLHttpRequest();
    xmlhttpVariations.onreadystatechange = function() {
        if (xmlhttpVariations.readyState == 4) {
            var responseWoocomerce = xmlhttpVariations.status;
            if (responseWoocomerce === 200) {
                var responseJson = JSON.parse(xmlhttpVariations.response);
                var variations = responseJson.variations;
                var currentPrice = responseJson.currentPrice;
                var description = responseJson.description;
                var productType = responseJson.type;
                // buildVariationsBlockInsideModal(data);
                callback(responseJson);
            }
        }
    };
    xmlhttpVariations.open("POST", hostname + ":8002/ebayVariations", true);
    xmlhttpVariations.setRequestHeader("Content-Type", "application/json");
    xmlhttpVariations.send(JSON.stringify({ productId: productId }));
}

function prepareeBayVariations(variations) {
    var globalvariation = {
        variations: [],
        NameValueList: []
    };
    variations.VariationSpecificsSet.NameValueList.forEach(function(item, index) {
        // _.each(variations.VariationSpecificsSet.NameValueList, function(item, index) {
        // if (index) {
        globalvariation.NameValueList.push({
            name: item.Name,
            value: item.Value,
            variation: true,
            visible: true
        });
        // }
    });
    variations.Variation.forEach(function(item, indexTrs) {
        // _.each(variations.Variation, function(item, indexTrs) {
        if (indexTrs && indexTrs < 100) {
            var attributesVariations = [];
            item.VariationSpecifics.NameValueList.forEach(function(element, index) {
                // _.each(item.VariationSpecifics.NameValueList, function(element, index) {
                // if(element.name.include('color') )
                attributesVariations.push({
                    name: element.Name,
                    value: element.Value[0],
                    image: ""
                });
            });
            globalvariation.variations.push({
                identifier: item.SKU,
                SKU: item.SKU,
                availQuantity: item.Quantity,
                salePrice: item.StartPrice.Value.toString(),
                regularPrice: item.StartPrice.Value.toString(),
                attributesVariations: attributesVariations,
                weight: ""
            });
        }
    });
    return globalvariation;
}

function prepareSpecifications(globalvariation, specifications) {
    if (specifications && specifications.NameValueList) {
        specifications.NameValueList.forEach(function(item) {
            // _.each(specifications.NameValueList, function(item) {
            globalvariation.NameValueList.push({
                name: item.Name,
                visible: true,
                variation: false,
                value: item.Value
            });
        });
    }
}
jQuery(document).on("click", "#ebayimportToShopBulk", function(event) {
    var productId = "";
    try {
        productId = jQuery(this)
            .parents(".card")
            .find("#sku")[0].innerText;

        console.log("------", productId);
        if (productId) {
            // jQuery(this).attr("disabled", true);
            jQuery(".ebayImportToS").each(function(item, element) {
                console.log("----- disabling");
                jQuery(element).attr("disabled", true);
            });

            buildEbayProduct(productId);
        }
    } catch (e) {
        jQuery(".ebayImportToS").each(function(item, element) {
            console.log("----- un - disabling 2");
            jQuery(element).attr("disabled", false);
        });
        displayToast(
            "cannot retrieve product id, please try again, if the issue persists, please contact wooebayimporter@gmail.com",
            "red"
        );
    }
});

jQuery(document).on("click", "#seacheBayProductsButton", function(event) {
    searcheBayProducts(1);
});
var isNotDraw = false;

function searcheBayProducts(pageNo) {
    jQuery("#ebay-pagination").show();
    jQuery("#ebay-pagination").empty();
    jQuery('#ebay-product-search-container').empty()
    let searchKeyword = jQuery("#searcheBayKeyword").val();

    if (searchKeyword) {
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                var responseWoocomerce = xmlhttp.status;
                if (responseWoocomerce === 200) {
                    try {
                        let jsonParsed = JSON.parse(xmlhttp.response);
                        data = jsonParsed.data;
                        let totalResult = parseInt(jsonParsed.totalResults);

                        console.log(data);

                        try {
                            // var jsonData = JSON.parse(data);
                            var products = data;

                            products.forEach(function(item) {
                                jQuery(
                                    '<div class="card text-center" style="flex: 1 1 20%; margin:30px; padding:50px">' +
                                    '  <div class="card-body">' +
                                    '<h5 class="card-title"> ' +
                                    item.title.substring(0, 70) +
                                    "</h5>" +
                                    '<img src="' +
                                    item.image +
                                    '" width="150"  height="150"></img>' +
                                    '<div>Price: <p class="card-text" ">' +
                                    item.price +
                                    "</div></p>" +
                                    'Sku: <p class="card-text" id="sku" ">' +
                                    item.id +
                                    "</p>" +
                                    "<div>" +
                                    '<div><a  style="width:100%" id="ebayimportToShopBulk" class="ebayImportToS btn btn-primary">Import to shop</a></div>' +
                                    '<div><a target="_blank" style="width:100%; margin-top:5px" href="' +
                                    item.productURl +
                                    '" class="btn btn-primary">Product url</a></div>' +
                                    "</div>" +
                                    "</div>" +
                                    "</div>"
                                ).appendTo("#ebay-product-search-container");
                            });

                            // var numberOfPage = Math.round(data / 40);
                            if (totalResult > 12) {
                                totalResult = 12;
                            }

                            // $('.ebay-page-item').remove();
                            // if (!isNotDraw) {
                            // isNotDraw = true;
                            for (var i = 1; i < totalResult; i++) {
                                jQuery(
                                    ' <li id="page-' +
                                    i +
                                    '" class="ebay-page-item"><a class="ebay-page-link">' +
                                    i +
                                    "</a></li>"
                                ).appendTo("#ebay-pagination");
                            }
                            // }
                        } catch (e) {
                            console.log("------ error ", e);
                            displayToast("Empty result for this search keyword", "red");
                        }
                    } catch (e) {}
                }
            }
        };

        xmlhttp.open("POST", hostname + ":8002/searchEbayProductsByName", true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(
            JSON.stringify({
                searchKeyword: searchKeyword,
                pageNo: pageNo
            })
        );
    } else {
        displayToast("Search keyword cannot be empty", "red");
    }
}

jQuery(document).on("click", ".ebay-page-item", function(event) {
    // window.open('https://wooshark.com/aliexpress')

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

    searcheBayProducts(pageNo);
});

function buildProduct(productId, callback) {
    // var categories = [];
    // if (chkArray && chkArray.length) {
    //     _.each(chkArray, function (item) {
    //         item = item.replace(/^\D+/g, '');
    //         // item.replace(" ", "");
    //         categories.push(parseInt(item));
    //     });
    // }

    if (productId) {
        var variations = getProductDetailsFromServerEbay(productId, function(response) {
            var title = response.title;
            var description = response.description;
            var variations = [];
            if (response.variations) {
                variations = prepareeBayVariations(response.variations);
            } else {
                variations = {
                    variations: [],
                    NameValueList: []
                };
            }
            var itemSpec = prepareSpecifications(variations, response.specifications);

            var salePrice = response.currentPrice;
            var regularPrice = response.currentPrice;
            var productUrl = response.productUrl;
            var finalDescription = response.Description;
            var availQuantity = response.quantity;
            var images = response.images;
            var categories = [];
            jQuery('.categories input:checked').each(function() {
                categories.push(jQuery(this).attr('value').trim());
            });

            var productCategoies = categories;


            // var productId = response.productId;
            var weight = "";
            var ebayProduct = {
                variations: variations,
                currentPrice: salePrice,
                originalPrice: regularPrice,
                title: title,
                description: description,
                productUrl: productUrl,
                productId: productId,
                productCategoies: productCategoies,
                shortDescription: "",
                importSalePrice: true,
                totalAvailQuantity: availQuantity || 1,
                images: images,
                simpleSku: productId,
                featured: true
            };

            callback(ebayProduct);
        });
    }
}

function importeBayProducts(item) {
    // var count = 1;
    // if (waitingListProducts && waitingListProducts.length) {
    var website = jQuery("#website")
        .val()
        .trim();
    var key_client = jQuery("#key_client")
        .val()
        .trim();
    var sec_client = jQuery("#sec_client")
        .val()
        .trim();

    // waitingListProducts.forEach(function(item) {
    // StartLoadingSpinner();
    var xmlhttpMultipl = new XMLHttpRequest();
    xmlhttpMultipl.onreadystatechange = function() {
        handleServerResponseebay(xmlhttpMultipl, true);
    };
    var isPublish = false;
    // if (bulkConfig.publishProduct) {
    isPublish = true;
    // }
    var isVariationImage = false;

    xmlhttpMultipl.open("POST", hostname + ":8002/wordpress", true);
    xmlhttpMultipl.setRequestHeader("Content-Type", "application/json");
    xmlhttpMultipl.send(
        JSON.stringify({
            aliExpressProduct: item,
            isPluginWordpress: true,
            isVariationImage: isVariationImage,
            isPublish: isPublish,
            clientWebsite: website,
            clientKey: key_client,
            clientSecretKey: sec_client
        })
    );
    // });
    // waitingListProducts = [];
    // }
}

function handleServerResponseebay(xmlhttp, fullImport) {
    if (xmlhttp.readyState == 4) {
        jQuery(".loader2").css({
            display: "none"
        });

        var responseWoocomerce = xmlhttp.status;

        if (responseWoocomerce === 200) {
            // stopLoadingSuccess(true);

            if (xmlhttp.response) {
                try {
                    var dataParsed = JSON.parse(xmlhttp.response);
                    var data = dataParsed ? dataParsed.data : "";
                    displayToast("Product imported successfully", "green");
                    incrementAllowedImport();
                    jQuery(".ebayImportToS").each(function(item, element) {
                        console.log("----- un - disabling");
                        jQuery(element).attr("disabled", false);
                    });
                    jQuery(".loader2").css({
                        display: "none"
                    });
                } catch (e) {
                    displayToast("exception during import", "red");
                    jQuery(".loader2").css({
                        display: "none"
                    });
                }
            }
        } else if (responseWoocomerce == 0) {
            // stopLoadingError();
            displayToast(
                "Error establishing connection to server This can be caused by 1- Firewall block or filtering 2- An installed browser extension is mucking things",
                "red"
            );
            jQuery(".loader2").css({
                display: "none"
            });
            jQuery(".ebayImportToS").each(function(item, element) {
                console.log("----- un - disabling");
                jQuery(element).attr("disabled", false);
            });
        } else if (responseWoocomerce == 500) {
            displayToast(
                "The server encountered an unexpected condition which prevented it from fulfilling the request, please try again or inform us by email wooebayimporter@gmail.com",
                "red"
            );
            jQuery(".loader2").css({
                display: "none"
            });
            jQuery(".ebayImportToS").each(function(item, element) {
                console.log("----- un - disabling");
                jQuery(element).attr("disabled", false);
            });
        } else if (responseWoocomerce == 413) {
            displayToast(
                "The server is refusing to process a request because the request entity is larger than the server is willing or able to process. The server MAY close the connection to prevent the client from continuing the request.",
                "red"
            );
            jQuery(".loader2").css({
                display: "none"
            });
            jQuery(".ebayImportToS").each(function(item, element) {
                console.log("----- un - disabling");
                jQuery(element).attr("disabled", false);
            });
        } else if (responseWoocomerce == 504) {
            displayToast(
                "Gateway Timeout Error, the server, acting as a gateway, timed out waiting for another server to respond",
                "red"
            );
            jQuery(".loader2").css({
                display: "none"
            });
            jQuery(".ebayImportToS").each(function(item, element) {
                console.log("----- un - disabling");
                jQuery(element).attr("disabled", false);
            });
        } else {
            // stopLoadingError();
            jQuery(".loader2").css({
                display: "none"
            });
            jQuery(".ebayImportToS").each(function(item, element) {
                console.log("----- un - disabling");
                jQuery(element).attr("disabled", false);
            });
            if (xmlhttp.response) {
                try {
                    var dataParsed = JSON.parse(xmlhttp.response);
                    var data = dataParsed ? dataParsed.data : "";
                    displayToast(data, "red");
                } catch (e) {
                    displayToast("error", "red");
                }
            }
        }
        jQuery(".loader2").css({
            display: "none"
        });
        jQuery(".ebayImportToS").each(function(item, element) {
            console.log("----- un - disabling");
            jQuery(element).attr("disabled", false);
        });
    }
}

function getCurrentTotalImportItemsValuesebay() {
    var totalImportItems = localStorage.getItem("totalImportItems");
    if (totalImportItems) {
        return parseInt(totalImportItems);
    } else {
        return 1;
    }
}

function incrementAllowedImport() {
    var newValue = getCurrentTotalImportItemsValuesebay() + 1;
    localStorage.setItem("totalImportItems", newValue);
    // console.log("------ totel imported item", newValue);
    // console.log("------ totel imported item", newValue);
    jQuery('#remaining').text('Imported products: ' + localStorage.getItem('totalImportItems') || 1);
}

function buildEbayProduct(productId) {
    var website = jQuery("#website")
        .val()
        .trim();
    if (getCurrentTotalImportItemsValues() < 50 || (website && website.includes('http://188.213.28.18'))) {
        jQuery(".loader2").css({
            display: "block",
            position: "fixed",
            "z-index": 9999,
            top: "50px",
            right: "50px",
            "border-radius": "35px",
            "background-color": "black"
        });

        buildProduct(productId, function(ebayProduct) {
            waitingListProducts.push(ebayProduct);
            importeBayProducts(ebayProduct);
        });
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
            window.open('https://www.wooshark.com/aliexpress-ebay-banggood-tmart')
        }, 3000);
    }
}

jQuery(document).on("click", "#importProductToShopBySkyeBay", function(event) {
    // alert('ssdd')
    waitingListProducts = [];
    var productId = jQuery("#productSkueBay").val();

    if (productId) {
        var productUrl = "https://aliexpress.com/item/" + productId + ".html";
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        const url = productUrl; // site that doesn’t send Access-Control-*

        buildEbayProduct(productId);
    } else {
        displayToast("Cannot get product sku", "red");
    }
});
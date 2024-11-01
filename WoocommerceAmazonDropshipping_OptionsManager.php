<?php
/*
    "WordPress Plugin Template" Copyright (C) 2018 Michael Simpson  (email : michael.d.simpson@gmail.com)

    This file is part of WordPress Plugin Template for WordPress.

    WordPress Plugin Template is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WordPress Plugin Template is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Contact Form to Database Extension.
    If not, see http://www.gnu.org/licenses/gpl-3.0.html
*/

class WoocommerceAmazonDropshipping_OptionsManager
{

    public function getOptionNamePrefix()
    {
        return get_class($this) . '_';
    }


    /**
     * Define your options meta data here as an array, where each element in the array
     * @return array of key=>display-name and/or key=>array(display-name, choice1, choice2, ...)
     * key: an option name for the key (this name will be given a prefix when stored in
     * the database to ensure it does not conflict with other plugin options)
     * value: can be one of two things:
     *   (1) string display name for displaying the name of the option to the user on a web page
     *   (2) array where the first element is a display name (as above) and the rest of
     *       the elements are choices of values that the user can select
     * e.g.
     * array(
     *   'item' => 'Item:',             // key => display-name
     *   'rating' => array(             // key => array ( display-name, choice1, choice2, ...)
     *       'CanDoOperationX' => array('Can do Operation X', 'Administrator', 'Editor', 'Author', 'Contributor', 'Subscriber'),
     *       'Rating:', 'Excellent', 'Good', 'Fair', 'Poor')
     */
    public function getOptionMetaData()
    {
        return array();
    }

    /**
     * @return array of string name of options
     */
    public function getOptionNames()
    {
        return array_keys($this->getOptionMetaData());
    }

    /**
     * Override this method to initialize options to default values and save to the database with add_option
     * @return void
     */
    protected function initOptions()
    { }

    /**
     * Cleanup: remove all options from the DB
     * @return void
     */
    protected function deleteSavedOptions()
    {
        $optionMetaData = $this->getOptionMetaData();
        if (is_array($optionMetaData)) {
            foreach ($optionMetaData as $aOptionKey => $aOptionMeta) {
                $prefixedOptionName = $this->prefix($aOptionKey); // how it is stored in DB
                delete_option($prefixedOptionName);
            }
        }
    }

    /**
     * @return string display name of the plugin to show as a name/title in HTML.
     * Just returns the class name. Override this method to return something more readable
     */
    public function getPluginDisplayName()
    {
        return get_class($this);
    }

    /**
     * Get the prefixed version input $name suitable for storing in WP options
     * Idempotent: if $optionName is already prefixed, it is not prefixed again, it is returned without change
     * @param  $name string option name to prefix. Defined in settings.php and set as keys of $this->optionMetaData
     * @return string
     */
    public function prefix($name)
    {
        $optionNamePrefix = $this->getOptionNamePrefix();
        if (strpos($name, $optionNamePrefix) === 0) { // 0 but not false
            return $name; // already prefixed
        }
        return $optionNamePrefix . $name;
    }

    /**
     * Remove the prefix from the input $name.
     * Idempotent: If no prefix found, just returns what was input.
     * @param  $name string
     * @return string $optionName without the prefix.
     */
    public function &unPrefix($name)
    {
        $optionNamePrefix = $this->getOptionNamePrefix();
        if (strpos($name, $optionNamePrefix) === 0) {
            return substr($name, strlen($optionNamePrefix));
        }
        return $name;
    }

    /**
     * A wrapper function delegating to WP get_option() but it prefixes the input $optionName
     * to enforce "scoping" the options in the WP options table thereby avoiding name conflicts
     * @param $optionName string defined in settings.php and set as keys of $this->optionMetaData
     * @param $default string default value to return if the option is not set
     * @return string the value from delegated call to get_option(), or optional default value
     * if option is not set.
     */
    public function getOption($optionName, $default = null)
    {
        $prefixedOptionName = $this->prefix($optionName); // how it is stored in DB
        $retVal = get_option($prefixedOptionName);
        if (!$retVal && $default) {
            $retVal = $default;
        }
        return $retVal;
    }

    /**
     * A wrapper function delegating to WP delete_option() but it prefixes the input $optionName
     * to enforce "scoping" the options in the WP options table thereby avoiding name conflicts
     * @param  $optionName string defined in settings.php and set as keys of $this->optionMetaData
     * @return bool from delegated call to delete_option()
     */
    public function deleteOption($optionName)
    {
        $prefixedOptionName = $this->prefix($optionName); // how it is stored in DB
        return delete_option($prefixedOptionName);
    }

    /**
     * A wrapper function delegating to WP add_option() but it prefixes the input $optionName
     * to enforce "scoping" the options in the WP options table thereby avoiding name conflicts
     * @param  $optionName string defined in settings.php and set as keys of $this->optionMetaData
     * @param  $value mixed the new value
     * @return null from delegated call to delete_option()
     */
    public function addOption($optionName, $value)
    {
        $prefixedOptionName = $this->prefix($optionName); // how it is stored in DB
        return add_option($prefixedOptionName, $value);
    }

    /**
     * A wrapper function delegating to WP add_option() but it prefixes the input $optionName
     * to enforce "scoping" the options in the WP options table thereby avoiding name conflicts
     * @param  $optionName string defined in settings.php and set as keys of $this->optionMetaData
     * @param  $value mixed the new value
     * @return null from delegated call to delete_option()
     */
    public function updateOption($optionName, $value)
    {
        $prefixedOptionName = $this->prefix($optionName); // how it is stored in DB
        return update_option($prefixedOptionName, $value);
    }

    /**
     * A Role Option is an option defined in getOptionMetaData() as a choice of WP standard roles, e.g.
     * 'CanDoOperationX' => array('Can do Operation X', 'Administrator', 'Editor', 'Author', 'Contributor', 'Subscriber')
     * The idea is use an option to indicate what role level a user must minimally have in order to do some operation.
     * So if a Role Option 'CanDoOperationX' is set to 'Editor' then users which role 'Editor' or above should be
     * able to do Operation X.
     * Also see: canUserDoRoleOption()
     * @param  $optionName
     * @return string role name
     */
    public function getRoleOption($optionName)
    {
        $roleAllowed = $this->getOption($optionName);
        if (!$roleAllowed || $roleAllowed == '') {
            $roleAllowed = 'Administrator';
        }
        return $roleAllowed;
    }

    /**
     * Given a WP role name, return a WP capability which only that role and roles above it have
     * http://codex.wordpress.org/Roles_and_Capabilities
     * @param  $roleName
     * @return string a WP capability or '' if unknown input role
     */
    protected function roleToCapability($roleName)
    {
        switch ($roleName) {
            case 'Super Admin':
                return 'manage_options';
            case 'Administrator':
                return 'manage_options';
            case 'Editor':
                return 'publish_pages';
            case 'Author':
                return 'publish_posts';
            case 'Contributor':
                return 'edit_posts';
            case 'Subscriber':
                return 'read';
            case 'Anyone':
                return 'read';
        }
        return '';
    }

    /**
     * @param $roleName string a standard WP role name like 'Administrator'
     * @return bool
     */
    public function isUserRoleEqualOrBetterThan($roleName)
    {
        if ('Anyone' == $roleName) {
            return true;
        }
        $capability = $this->roleToCapability($roleName);
        return current_user_can($capability);
    }

    /**
     * @param  $optionName string name of a Role option (see comments in getRoleOption())
     * @return bool indicates if the user has adequate permissions
     */
    public function canUserDoRoleOption($optionName)
    {
        $roleAllowed = $this->getRoleOption($optionName);
        if ('Anyone' == $roleAllowed) {
            return true;
        }
        return $this->isUserRoleEqualOrBetterThan($roleAllowed);
    }

    /**
     * see: http://codex.wordpress.org/Creating_Options_Pages
     * @return void
     */
    public function createSettingsMenu()
    {
        $pluginName = $this->getPluginDisplayName();
        //create new top-level menu
        add_menu_page(
            $pluginName . ' Plugin Settings',
            $pluginName,
            'administrator',
            get_class($this),
            array(&$this, 'settingsPage')
            /*,plugins_url('/images/icon.png', __FILE__)*/
        ); // if you call 'plugins_url; be sure to "require_once" it

        //call register settings function
        add_action('admin_init', array(&$this, 'registerSettings'));
    }

    public function registerSettings()
    {
        $settingsGroup = get_class($this) . '-settings-group';
        $optionMetaData = $this->getOptionMetaData();
        foreach ($optionMetaData as $aOptionKey => $aOptionMeta) {
            register_setting($settingsGroup, $aOptionMeta);
        }
    }

    /**
     * Creates HTML for the Administration page to set options for this plugin.
     * Override this method to create a customized page.
     * @return void
     */
    public function settingsPage()
    {

        wp_enqueue_script('amazon', plugin_dir_url(__FILE__) . 'js/startup.js', array('jquery'), NULL, false);
        wp_enqueue_script('toast', plugin_dir_url(__FILE__) . 'js/jquery.toast.min.js', array('jquery'), NULL, false);
        wp_enqueue_script('ebayomport', plugin_dir_url(__FILE__) . 'js/ebay-import.js', array('jquery'), NULL, false);
        wp_enqueue_style('bootstrapCss', plugin_dir_url(__FILE__) . 'css/bootstrap.min.css');
        wp_enqueue_style('toastCss', plugin_dir_url(__FILE__) . 'css/jquery.toast.min.css');
        wp_enqueue_style('custom', plugin_dir_url(__FILE__) . 'css/main.css');
        wp_enqueue_script('bootstrap', plugin_dir_url(__FILE__) . 'js/bootstrap.min.js', array('jquery'), NULL, false);



        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'woocommerce-amazon-dropshipping'));
        }

        $optionMetaData = $this->getOptionMetaData();
        // HTML for the page
        $settingsGroup = get_class($this) . '-settings-group';
        ?>







            <script src="https://kit.fontawesome.com/45abdd2158.js" crossorigin="anonymous"></script>



            <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist" style="padding-top:50px">

                <li class="nav-item active">
                    <a class="nav-link " id="pills-home-tab" data-toggle="pill" href="#pills-home" role="tab" aria-controls="pills-home" aria-selected="false">AliExpress Import</a>
                </li>



                <li class="nav-item">
                    <a class="nav-link" id="pills-ebay-tab" data-toggle="pill" href="#pills-ebay" role="tab" aria-controls="pills-ebay" aria-selected="true">eBay - import</a>
                </li>











                <!-- 
    <li class="nav-item">
        <a class="nav-link " id="pills-amazon-tab" disabled data-toggle="pill"  role="tab" aria-controls="pills-home" aria-selected="false">Amazon Import <small style="color:red"> (available in pro version)</small></a>
    </li>



    <li class="nav-item">
        <a class="nav-link " id="pills-etsy-tab" disabled data-toggle="pill"  role="tab" aria-controls="pills-home" aria-selected="false">Etsy Import<small style="color:red"> (available in pro version)</small></a>
    </li> -->





                <li class="nav-item">
                    <a class="nav-link" id="pills-connect-tab" data-toggle="pill" href="#pills-connect" role="tab" aria-controls="pills-connect" aria-selected="false">Connect to store</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="pills-connect-products" data-toggle="pill" href="#pills-products" role="tab" aria-controls="pills-connect" aria-selected="false">Products - wooshark</a>
                </li>

                <!-- <li class="nav-item">
        <a class="nav-link" id="pills-configuration-tab" data-toggle="pill" href="#pills-configuration" role="tab" aria-controls="pills-configuration" aria-selected="false">Configuration</a>
    </li> -->

                <li class="nav-item">
                    <a class="nav-link" id="pills-advanced-tab" data-toggle="pill" href="#pills-advanced" role="tab" aria-controls="pills-advanced" aria-selected="false">Pro features</a>
                </li>

                <!-- <li class="nav-item">
                    <a class="nav-link" id="pills-support" data-toggle="pill" href="#pills-support" role="tab" aria-controls="pills-support" aria-selected="false">Support</a>
                </li> -->



            </ul>



            <!-- ///////////////////////////////////////////// -->
            <!-- ///////////////////////////////////////////// -->

            <!-- ///////////////////////////////////////////// -->
            <!-- ///////////////////////////////////////////// -->
            <!-- ////////////////EBAY EBAY///////////////////////////// -->
            <!-- ///////////////////////////////////////////// -->
            <!-- ///////////////////////////////////////////// -->
            <!-- ///////////////////////////////////////////// -->
            <!-- ///////////////////////////////////////////// -->
            <!-- ///////////////////////////////////////////// -->




            <div class="tab-content" id="pills-tabContent">






                <div class="tab-pane fade" id="pills-ebay" role="tabpanel" aria-labelledby="pills-ebay-products">

                    <button target="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart" class="btn btn-default" style="background-color: green;float: right;padding: 21px;font-size: 19px;color: white;font-family: fantasy;" type="button" class="close">
                        <a style="color:white" target="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <small> INSTALL WOOSHARK CHROME EXTENSION</small> </a>
                    </button>


                    <div style="margin-top:10px; background-color:white" class="alert alert-danger alert-dismissible fade show" role="alert" id="section-2">
                        <img class="display-block margin-right" width="100" src="<?php echo plugin_dir_url(__FILE__) . 'images/wooshark.png'; ?>" alt="chrome extension">

                        <!-- <h1 style="text-align:center; padding:10px">Start WordPress Dropshipping buisiness using Wooshark</h1> -->
                        <h3 style="text-align:center;">Discover Wooshark Dropshipping for AliExpress, ebay, amazon and etsy</h3>
                        <!-- <h1 style="font-size:25px; color:black; text-align:right">Get the chrome extension from here  </h1> -->
                        <div class="alert alert-default alert-dismissible fade show" role="alert" id="section-1" style="margin-top:10px; padding-left: 0px; text-align:right;  font-size: 30px;; font-family: fantasy">
                            <img class="display-block margin-right" width="16" src="<?php echo plugin_dir_url(__FILE__) . 'images/chrome-extension-logo.png'; ?>" alt="chrome extension">

                            <strong>Save time and efforts by getting the chrome extension from here <a targer="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <i class="fas fa-download fa-1x"></i> </a></strong>
                            <button type="button" class="close" id="close-1" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>

                        <h4>Free import / month: 50</h4>
                        <h4 id="remaining">Remaining <span class="badge badge-secondary"></span></h4>
                    </div>



                    <div class="wrap">


                        <div id="connected" style="padding:5px; display:none">

                            <i style="color:green" class="fas fa-wifi fa-3x">
                                <h4>Great, you are now connected to your store and ready to start importing products</h4>
                            </i>

                        </div>


                        <div class="not-connected" style="padding:5px;display:none">

                            <i style="color:red" class="fas fa-wifi fa-3x">
                                <h4>You are not connected to your store, please connect to your store from the connect tab <a href="#pills-connect-tab"></a></h4>
                            </i>

                        </div>






                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import title <small style="color:green"></small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import variations <small style="color:green"></small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import specifications <small style="color:green"></small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import images <small style="color:green"></small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import stock <small style="color:green"></small>
                            </label>
                        </div>


                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import Price and sale price<small style="color:green"></small>
                            </label>
                        </div>


                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import Sku and Categories<small style="color:green"></small>
                            </label>
                        </div>






                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import and customize description <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>


                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import and customize Reviews and rating <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck2" disabled>
                            <label style="color:grey" class="form-check-label" for="defaultCheck2">
                                Use up to 10 stores <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>


                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Unlimited import <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Bulk import <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>
                        <!-- <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                <label class="form-check-label" for="defaultCheck1" style="color:grey">
                    Customize title, price and short description <small style="color:green">(available on the chrome extension)</small>
                </label>
            </div> -->
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Synchronize stock and price <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Place orders on AliExpress <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>


                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck2" disabled>
                            <label style="color:grey" class="form-check-label" for="defaultCheck2">
                                Import and customize reviews images <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>


                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck2" disabled>
                            <label style="color:grey" class="form-check-label" for="defaultCheck2">
                                customize variations and specifications <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck2" disabled>
                            <label style="color:grey" class="form-check-label" for="defaultCheck2">
                                Set up markup price (price formula) <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck2" disabled>
                            <label style="color:grey" class="form-check-label" for="defaultCheck2">
                                Edit and select which images to import <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck2" checked>
                            <label class="form-check-label" for="defaultCheck2">
                                Choose categories
                            </label>
                        </div>





                        <button id="select-category" style="margin-top:5px" class="btn btn-primary"> Show and select Categories</button>

                        <div class="categories" style="display:none">

                        </div>
                        <!-- </div> -->
                        <hr>

                        <h1>Import products From eBay to store</h1>

                        <div>
                            <h3 style=" color:white"> Import products From eBay to store</h3>
                            <div class="loader2" style="display:none">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                            <!-- <label for="productSkueBay"> Insert by Sku :</label>
                <div style="display:flex">
                    <div style="flex:4 1 80%; margin-right:10px">
                        <input class="form-control" type="number" id="productSkueBay" placeholder="paste eBay product Sku" />
                    </div>
                    <div style="flex: 1 1 20%">
                        <button class="btn btn-primary" style="width:100%" id="importProductToShopBySkyeBay"> Import</button>
                    </div>
                </div> -->


                            <div style="height:30px">
                            </div>
                        </div>

                        <div class="search-form">
                            <label>Search ebay by keyword</label><input placeholder='Search keyword example, shoes, smartphones, etc..' type='text' class="form-control" id="searcheBayKeyword">
                            <button style="margin-top:10px" class="btn btn-success" id="seacheBayProductsButton"> Search eBay Products</button>

                        </div>
                        <div id="ebay-product-search-container" style="display:flex; -justify-content: space-between;flex-wrap:wrap">

                        </div>

                        <nav aria-label="pagination" style="text-align:center;">
                            <ul id="ebay-pagination" class="pagination pagination-lg justify-content-center">
                                <li id="ebay-page-1" class="ebay-page-item"><a class="page-link active active">1</a></li>

                                <!-- <li class="page-item"><a class="page-link" href="#">2</a></li> -->
                                <!-- <li class="page-item"><a class="page-link" href="#">3</a></li> -->
                            </ul>
                        </nav>





                    </div>







                </div>





                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->

                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- //////////////ALIEXPRESS/////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->

                <div class="tab-pane fade active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">

                    <button target="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart" class="btn btn-default" style="background-color: green;float: right;padding: 21px;font-size: 19px;color: white;font-family: fantasy;" type="button" class="close">
                        <a style="color:white" target="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <small> INSTALL WOOSHARK CHROME EXTENSION</small> </a>
                    </button>


                    <div style="margin-top:10px; background-color:white" class="alert alert-danger alert-dismissible fade show" role="alert" id="section-2">
                        <img class="display-block margin-right" width="100" src="<?php echo plugin_dir_url(__FILE__) . 'images/wooshark.png'; ?>" alt="chrome extension">

                        <!-- <h1 style="text-align:center; padding:10px">Start WordPress Dropshipping buisiness using Wooshark</h1> -->
                        <h3 style="text-align:center;">Discover Wooshark Dropshipping for AliExpress, ebay, amazon and etsy</h3>
                        <!-- <h1 style="font-size:25px; color:black; text-align:right">Get the chrome extension from here  </h1> -->
                        <div class="alert alert-default alert-dismissible fade show" role="alert" id="section-1" style="margin-top:10px; padding-left: 0px; text-align:right;  font-size: 30px;; font-family: fantasy">
                            <img class="display-block margin-right" width="16" src="<?php echo plugin_dir_url(__FILE__) . 'images/chrome-extension-logo.png'; ?>" alt="chrome extension">

                            <strong>Save time and efforts by getting the chrome extension from here <a targer="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <i class="fas fa-download fa-1x"></i> </a></strong>
                            <button type="button" class="close" id="close-1" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <h4>Free import / month: 50</h4>
                        <h4 id="remaining">Remaining <span class="badge badge-secondary"></span></h4>




                    </div>



                    <div class="wrap">
                        <h1>AliExpress</h1>

                        <div id="connected" style="padding:5px; display:none">

                            <i style="color:green" class="fas fa-wifi fa-3x">
                                <h4>Great, you are now connected to your store and ready to start importing products</h4>
                            </i>

                        </div>


                        <div class="not-connected" style="padding:5px;display:none">

                            <i style="color:red" class="fas fa-wifi fa-3x">
                                <h4>You are not connected to your store, please connect to your store from the connect tab <a href="#pills-connect-tab"></a></h4>
                            </i>

                        </div>











                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import title <small style="color:green"></small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import variations <small style="color:green"></small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import specifications <small style="color:green"></small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import images <small style="color:green"></small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import stock <small style="color:green"></small>
                            </label>
                        </div>


                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import Price and sale price<small style="color:green"></small>
                            </label>
                        </div>


                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import Sku and Categories<small style="color:green"></small>
                            </label>
                        </div>






                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import and customize description <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>


                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Import and customize Reviews and rating <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck2" disabled>
                            <label style="color:grey" class="form-check-label" for="defaultCheck2">
                                Use up to 10 stores <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>


                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Unlimited import <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Bulk import <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>
                        <!-- <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                <label class="form-check-label" for="defaultCheck1" style="color:grey">
                    Customize title, price and short description <small style="color:green">(available on the chrome extension)</small>
                </label>
            </div> -->
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Synchronize stock and price <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" disabled>
                            <label class="form-check-label" for="defaultCheck1" style="color:grey">
                                Place orders on AliExpress <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>


                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck2" disabled>
                            <label style="color:grey" class="form-check-label" for="defaultCheck2">
                                Import and customize reviews images <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>


                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck2" disabled>
                            <label style="color:grey" class="form-check-label" for="defaultCheck2">
                                customize variations and specifications <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck2" disabled>
                            <label style="color:grey" class="form-check-label" for="defaultCheck2">
                                Set up markup price (price formula) <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck2" disabled>
                            <label style="color:grey" class="form-check-label" for="defaultCheck2">
                                Edit and select which images to import <small style="color:green">(available on the chrome extension)</small>
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="defaultCheck2" checked>
                            <label class="form-check-label" for="defaultCheck2">
                                Choose categories
                            </label>
                        </div>








                        <!-- <button id="price-formula" style="margin-top:5px" class="btn btn-primary"> Set </button>
             <div class="markup" style="display:none">

            </div> -->

                        <!-- <button id="select-category" style="margin-top:5px" class="btn btn-primary"> Show and select Categories</button> -->

                        <div class="categories">

                        </div>

                        <hr>

                        <div>
                            <h3> Import products From AliExpress to store</h3>


                            <div class="loader2" style="display:none">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                            <!-- <label for="productSku"> Insert by Sku :</label>
                <div style="display:flex">
                    <div style="flex:4 1 80%; margin-right:10px">
                        <input class="form-control" type="number" id="productSku" placeholder="paste AliExpress product Sku" />
                    </div>
                    <div style="flex: 1 1 20%">
                        <button class="btn btn-primary" style="width:100%" id="importProductToShopBySky"> Import</button>

                    </div>
                </div> -->


                            <!-- <div style="height:30px">
                </div>

                <label for="productUrl"> Insert by Url :</label>
                <div style="display:flex">
                    <div style="flex: 4 1 80%; margin-right:10px">

                        <input class="form-control" type="text" id="productUrl" placeholder="paste AliExpress product url" />
                    </div>
                    <div style="flex: 1 1 20%">

                        <button class="btn btn-primary" style="width:100%" id="importProductToShopByUrl"> Import</button>
                    </div>
                </div> -->




                        </div>

                        <div class="search-form">
                            <label>Search by keyword</label><input placeholder='Search keyword example, shoes, smartphones, etc..' type='text' class="form-control" id="searchKeyword">
                            <button style="margin-top:10px" class="btn btn-success" id="seachProductsButton"> Search Products</button>


                            <div style="padding:10px"> <input type="radio" name="language" value="en" checked="checked"> English<br></div>
                            <div style="padding:10px"><input type="radio" name="language" value="fr"> French<br></div>
                            <div style="padding:10px"><input type="radio" name="language" value="en" disabled> Other (pt,ru,es,id,it,nl,tr,vi,th,de,ko,ja,ar,pl,he) <small style="color:green">(available on the chrome extension)</small> <br></div>

                            <!-- <input type="radio" name="gender" value="other"> Other -->


                        </div>
                        <div id="product-search-container" style="display:flex; -justify-content: space-between;flex-wrap:wrap">

                        </div>

                        <nav aria-label="pagination" style="text-align:center;">
                            <ul id="pagination" class="pagination pagination-lg justify-content-center">
                                <!-- <li id="page-1" class="page-item"><a class="page-link active active">1</a></li> -->

                                <!-- <li class="page-item"><a class="page-link" href="#">2</a></li> -->
                                <!-- <li class="page-item"><a class="page-link" href="#">3</a></li> -->
                            </ul>
                        </nav>





                    </div>



                    <hr>
<div style="display-flex">
                    <!-- <div class="card text-center" style="flex: 1 1 33%; margin:30px; padding:50px"> -->


                    <iframe width="560" height="315" style="flex: 1 1 33%;" src="https://www.youtube.com/embed/z80oGZvMnCA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>



                    <iframe width="560" style="flex: 1 1 33%;" height="315" src="https://www.youtube.com/embed/TYINWrZpRD4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

                    <!-- </div> -->


                    <!-- <div class="card text-center" style="flex: 1 1 33%; margin:30px; padding:50px"> -->
                    <iframe width="560" style="flex: 1 1 33%;" height="315" src="https://www.youtube.com/watch?v=i8mXaDCmhUw" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

                    <!-- </div> -->



                    <!-- <div class="card text-center" style="flex: 1 1 33%; margin:30px; padding:50px"> -->

                    <!-- </div> -->




                </div>
                </div>



                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->




                <div class="tab-pane fade" id="pills-products" role="tabpanel" aria-labelledby="pills-products-products">
                    <div style="margin-top:10px; background-color:white" class="alert alert-danger alert-dismissible fade show" role="alert" id="section-2">
                        <button target="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart" class="btn btn-default" style="background-color: green;float: right;padding: 21px;font-size: 19px;color: white;font-family: fantasy;" type="button" class="close">
                            <a style="color:white" target="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <small> INSTALL WOOSHARK CHROME EXTENSION</small> </a>
                        </button>
                        <img class="display-block margin-right" width="100" src="<?php echo plugin_dir_url(__FILE__) . 'images/wooshark.png'; ?>" alt="chrome extension">

                        <!-- <h1 style="text-align:center; padding:10px">Start WordPress Dropshipping buisiness using Wooshark</h1> -->
                        <h3 style="text-align:center;">Discover Wooshark Dropshipping for AliExpress, ebay, amazon and etsy</h3>
                        <!-- <h1 style="font-size:25px; color:black; text-align:right">Get the chrome extension from here  </h1> -->
                        <div class="alert alert-default alert-dismissible fade show" role="alert" id="section-1" style="margin-top:10px; padding-left: 0px; text-align:right;  font-size: 30px;; font-family: fantasy">
                            <img class="display-block margin-right" width="16" src="<?php echo plugin_dir_url(__FILE__) . 'images/chrome-extension-logo.png'; ?>" alt="chrome extension">

                            <strong>Save time and efforts by getting the chrome extension from here <a targer="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <i class="fas fa-download fa-1x"></i> </a></strong>
                            <button type="button" class="close" id="close-1" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>

                        <h4>Free import / month: 50</h4>
                        <h4 id="remaining">Remaining <span class="badge badge-secondary"></span></h4>

                    </div>

                    <table id="products-wooshark" class="table table-striped">
                        <thead>
                            <tr>
                                <th width="20%">image</th>
                                <th width="20%">id</th>
                                <th width="20%">title</th>
                                <th width="20%">price</th>
                                <th width="20%">link to original page</th>
                            </tr>
                        </thead>
                    </table>

                    <nav aria-label="product-pagination" style="text-align:center;">
                        <ul id="product-pagination" class="pagination pagination-lg justify-content-center">
                            <!-- <li id="product-page-1" class="-product-page-item"><a class="page-link active active">1</a></li> -->

                            <!-- <li class="page-item"><a class="page-link" href="#">2</a></li> -->
                            <!-- <li class="page-item"><a class="page-link" href="#">3</a></li> -->
                        </ul>
                    </nav>



                </div>



                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->
                <!-- ///////////////////////////////////////////// -->





                <!-- ///////////////////////////////////////////// -->


                <div class="tab-pane fade" id="pills-connect" role="tabpanel" aria-labelledby="pills-connect-tab">
                    <div style="margin-top:10px; background-color:white" class="alert alert-danger alert-dismissible fade show" role="alert" id="section-2">
                        <button target="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart" class="btn btn-default" style="background-color: green;float: right;padding: 21px;font-size: 19px;color: white;font-family: fantasy;" type="button" class="close">
                            <a style="color:white" target="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <small> INSTALL WOOSHARK CHROME EXTENSION</small> </a>
                        </button>
                        <img class="display-block margin-right" width="100" src="<?php echo plugin_dir_url(__FILE__) . 'images/wooshark.png'; ?>" alt="chrome extension">

                        <!-- <h1 style="text-align:center; padding:10px">Start WordPress Dropshipping buisiness using Wooshark</h1> -->
                        <h3 style="text-align:center;">Discover Wooshark Dropshipping for AliExpress, ebay, amazon and etsy</h3>
                        <!-- <h1 style="font-size:25px; color:black; text-align:right">Get the chrome extension from here  </h1> -->
                        <div class="alert alert-default alert-dismissible fade show" role="alert" id="section-1" style="margin-top:10px; padding-left: 0px; text-align:right;  font-size: 30px;; font-family: fantasy">
                            <img class="display-block margin-right" width="16" src="<?php echo plugin_dir_url(__FILE__) . 'images/chrome-extension-logo.png'; ?>" alt="chrome extension">

                            <strong>Save time and efforts by getting the chrome extension from here <a targer="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <i class="fas fa-download fa-1x"></i> </a></strong>
                            <button type="button" class="close" id="close-1" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <h4>Free import / month: 50</h4>
                        <h4 id="remaining">Remaining <span class="badge badge-secondary"></span></h4>

                    </div>

                    <div class="loader" style="display:none; z-index:9999">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>

                    <p style="color:blue">
                    if you are facing issue during authentification, please contact our support wooebayimporter@gmail.com, if possible grant us a temporary
                    access to your wordpress so that we can help you to establish the connection. please on the email object specify the following: support wordpress plugin banggood aliexpress
                            </p>

                    <!-- <button class="btn btn-info" id="displayConnectToStore" style="    font-family: fantasy;background-color; #ddd5d5;  color: white; margin-bottom:5px">Connect to store</button> -->

                    <div id="connect-to-store">

                        <div>
                            <label for="website"> Wordpress url</label>
                            <input class="website form-control" id="website" type="text" name="website" placeholder="Wordpress url, Must start with http or https" />

                        </div>


                        <div>
                            <label for="key_client"> Your Key client :</label>

                            <input class="key_client form-control" id="key_client" type="text" name="key_client" placeholder="Your Key client.." />

                        </div>
                        <div>

                            <label for="sec_client"> Your secret client :</label>

                            <input class="sec_client form-control" id="sec_client" type="text" name="sec_client" placeholder="Your secret client.." />


                        </div>


                        <button class="btn btn-primary" style="margin-top:5px" id="connectToStore"> Connect to store </button>
                        <button class="btn btn-default" style="margin:5px"><a href="https://youtu.be/OB4D-4QDGAk"> How to generate client key and secret key (video) </a></button>

                        <div id="isConnectedArea" style="width:100%; border: 1 px black; padding:10px; height:30px"></div>


                    </div>





                </div>


                
                <!-- <div class="tab-pane fade" id="pills-support" role="tabpanel" aria-labelledby="pills-support">
                    <div style="margin-top:10px; background-color:white" class="alert alert-danger alert-dismissible fade show" role="alert" id="section-2">
                        <button class="btn btn-default" style="background-color: green;float: right;padding: 21px;font-size: 19px;color: white;font-family: fantasy;" type="button" class="close">
                            <a style="color:white" target="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <small> INSTALL WOOSHARK CHROME EXTENSION</small> </a>
                        </button>
                        <img class="display-block margin-right" width="100" src="<?php echo plugin_dir_url(__FILE__) . 'images/wooshark.png'; ?>" alt="chrome extension">

                        <h3 style="text-align:center;">Discover Wooshark Dropshipping for AliExpress, ebay, amazon and etsy</h3>
                        <div class="alert alert-default alert-dismissible fade show" role="alert" id="section-1" style="margin-top:10px; padding-left: 0px; text-align:right;  font-size: 30px;; font-family: fantasy">
                            <img class="display-block margin-right" width="16" src="<?php echo plugin_dir_url(__FILE__) . 'images/chrome-extension-logo.png'; ?>" alt="chrome extension">

                            <strong>Save time and efforts by getting the chrome extension from here <a targer="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <i class="fas fa-download fa-1x"></i> </a></strong>
                            <button type="button" class="close" id="close-1" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <h4>Free import / month: 50</h4>
                        <h4 id="remaining">Remaining <span class="badge badge-secondary"></span></h4>

                    </div>

                    <p>
                    if you are facing issue during authentification, please contact our support wooebayimporter@gmail.com, if possible grant us a temporary
                    access to your wordpress so that we can help you to establish the connection.
                            </p>



                </div> -->



                <div class="tab-pane fade" id="pills-advanced" role="tabpanel" aria-labelledby="pills-advanced-tab">
                    <div style="margin-top:10px; background-color:white" class="alert alert-danger alert-dismissible fade show" role="alert" id="section-2">
                        <button target="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart" class="btn btn-default" style="background-color: green;float: right;padding: 21px;font-size: 19px;color: white;font-family: fantasy;" type="button" class="close">
                            <a style="color:white" target="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <small> INSTALL WOOSHARK CHROME EXTENSION</small> </a>
                        </button>
                        <img class="display-block margin-right" width="100" src="<?php echo plugin_dir_url(__FILE__) . 'images/wooshark.png'; ?>" alt="chrome extension">

                        <!-- <h1 style="text-align:center; padding:10px">Start WordPress Dropshipping buisiness using Wooshark</h1> -->
                        <h3 style="text-align:center;">Discover Wooshark Dropshipping for AliExpress, ebay, amazon and etsy</h3>
                        <!-- <h1 style="font-size:25px; color:black; text-align:right">Get the chrome extension from here  </h1> -->
                        <div class="alert alert-default alert-dismissible fade show" role="alert" id="section-1" style="margin-top:10px; padding-left: 0px; text-align:right;  font-size: 30px;; font-family: fantasy">
                            <img class="display-block margin-right" width="16" src="<?php echo plugin_dir_url(__FILE__) . 'images/chrome-extension-logo.png'; ?>" alt="chrome extension">

                            <strong>Save time and efforts by getting the chrome extension from here <a targer="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <i class="fas fa-download fa-1x"></i> </a></strong>
                            <button type="button" class="close" id="close-1" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <h4>Free import / month: 50</h4>
                        <h4 id="remaining">Remaining <span class="badge badge-secondary"></span></h4>

                    </div>





                    <div style="display:flex; -justify-content: space-between;">
                        <div class="card text-center" style="flex: 1 1 20%; margin:30px; padding:50px">

                            <div class="card-body">
                                <h5 class="card-title"> Unlimited import <i class="far fa-file fa-2x"></i></h5>
                                <p class="card-text" style="min-height: 90px;">No import limit we don't have limits on the number of products you import. No extra fees! we guarantee this.</p>
                                <div>
                                    <a href="#" class="btn btn-primary" disabled>watch the video</a>
                                </div>
                            </div>

                        </div>

                        <div class="card text-center" style="flex: 1 1 20%; margin:30px; padding:50px">
                            <div class="card-body">
                                <h5 class="card-title"> Multiple store support <i class="fas fa-clone fa-2x"></i></h5>
                                <p class="card-text" style="min-height: 90px;">One license is valid for uo to 10 woocommerce stores.
                                    <div>
                                        <a href="#" disabled class="btn btn-primary">watch the video</a>
                                    </div>
                            </div>

                        </div>


                        <div class="card text-center" style="flex: 1 1 20%; margin:30px; padding:50px">

                            <div class="card-body">
                                <h5 class="card-title"> Bulk import <i class="far fa-copy fa-2x"></i> </h5>
                                <p class="card-text" style="min-height: 90px;">Wooshark alloww to select and import many products including all product details with one single click.</p>
                                <div>
                                    <a href="https://www.youtube.com/watch?v=i8mXaDCmhUw" class="btn btn-primary">watch the video</a>
                                </div>
                            </div>

                        </div>



                        <div class="card text-center" style="flex: 1 1 20%; margin:30px; padding:50px">

                            <div class="card-body">
                                <h5 class="card-title"> Reviews management <i class="far fa-edit fa-3x"></i></h5>

                                <p class="card-text" style="min-height: 90px;">Wooshark allow import and customize reviews from aliexpress, including images, text content, date and rating.</p>
                                <div>
                                    <a href="https://www.youtube.com/watch?v=lprrArnDc9M" class="btn btn-primary">Watch the video</a>
                                </div>
                            </div>

                        </div>




                    </div>

                    <div style="display:flex; -justify-content: space-between;">

                        <div class="card text-center" style="flex: 1 1 20%; margin:30px; padding:50px">

                            <div class="card-body">
                                <h5 class="card-title"> Automated price foruma <i class="fab fa-cc-paypal fa-3x"></i> </h5>
                                <p class="card-text" style="min-height: 90px;"> Wooshark offer the possibility to define formula and automate price calculation and margin profir</p>
                                <div>
                                    <a href="https://www.youtube.com/watch?v=SzMEfaqAVps" class="btn btn-primary">watch the video</a>
                                </div>

                            </div>
                        </div>

                        <div class="card text-center" style="flex: 1 1 20%; margin:30px; padding:50px">

                            <div class="card-body">
                                <h5 class="card-title"> Advanced description editor <i class="fas fa-spell-check fa-3x"></i> </h5>
                                <p class="card-text" style="min-height: 90px;">Wooshark offers an advaned description editor that allow to edit the description in real time and see the expected result.</p>
                                <div>
                                    <a href="#" class="btn btn-primary">watch the video</a>
                                </div>

                            </div>
                        </div>

                        <div class="card text-center" style="flex: 1 1 20%; margin:30px; padding:50px">

                            <div class="card-body">
                                <h5 class="card-title"> Advanced image editor <i class="fas fa-image fa-3x"></i> </h5>
                                <p class="card-text" style="min-height: 90px;">Wooshark offer an advaned image editor that allows to editor pictures and add/remove some effects.</p>
                                <div>
                                    <a href="#" disabled class="btn btn-primary">watch the video</a>
                                </div>

                            </div>
                        </div>

                        <div class="card text-center" style="flex: 1 1 20%; margin:30px; padding:50px">

                            <div class="card-body">
                                <h5 class="card-title"> variations editor <i class="fab fa-buromobelexperte  fa-3x"></i> </h5>
                                <p class="card-text" style="min-height: 90px;">Wooshark allow import and customize reviews from aliexpress, including images, text content, date and rating.</p>
                                <div>
                                    <a href="#" disabled class="btn btn-primary">watch the video</a>
                                </div>

                            </div>
                        </div>

                    </div>

                    <iframe width="560" height="315" src="https://www.youtube.com/embed/i8mXaDCmhUw" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/lprrArnDc9M" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/i8mXaDCmhUw" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>


                <div class="tab-pane fade" id="pills-configuration" role="tabpanel" aria-labelledby="pills-configuration-tab">
                    <div style="margin-top:10px; background-color:white" class="alert alert-danger alert-dismissible fade show" role="alert" id="section-2">
                        <button class="btn btn-default" style="background-color: green;float: right;padding: 21px;font-size: 19px;color: white;font-family: fantasy;" type="button" class="close">
                            <a style="color:white" target="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <small> INSTALL WOOSHARK CHROME EXTENSION</small> </a>
                        </button>
                        <img class="display-block margin-right" width="100" src="<?php echo plugin_dir_url(__FILE__) . 'images/wooshark.png'; ?>" alt="chrome extension">

                        <!-- <h1 style="text-align:center; padding:10px">Start WordPress Dropshipping buisiness using Wooshark</h1> -->
                        <h3 style="text-align:center;">Discover Wooshark Dropshipping for AliExpress, ebay, amazon and etsy</h3>
                        <!-- <h1 style="font-size:25px; color:black; text-align:right">Get the chrome extension from here  </h1> -->
                        <div class="alert alert-default alert-dismissible fade show" role="alert" id="section-1" style="margin-top:10px; padding-left: 0px; text-align:right;  font-size: 30px;; font-family: fantasy">
                            <img class="display-block margin-right" width="16" src="<?php echo plugin_dir_url(__FILE__) . 'images/chrome-extension-logo.png'; ?>" alt="chrome extension">

                            <strong>Save time and efforts by getting the chrome extension from here <a targer="_blank" href="https://www.wooshark.com/aliexpress-ebay-banggood-tmart"> <i class="fas fa-download fa-1x"></i> </a></strong>
                            <button type="button" class="close" id="close-1" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <h4>Free import / month: 50</h4>
                        <h4 id="remaining">Remaining <span class="badge badge-secondary"></span></h4>

                    </div>


                    <div style="padding:5px"> <input type="checkbox" disabled id="isPublish" name="isPublish"> <span for="isPublish">Publish product / save it as a draft <span><br></div>
                    <div style="padding:5px"> <input type="checkbox" disabled id="isSpecification" name="isSpecification"> Import product specification<br></div>
                    <div style="padding:5px"> <input type="checkbox" disabled id="isImages" name="isImages"> Import images<br></div>
                    <div style="padding:5px"> <input type="checkbox" disabled id="isDescription" name="isDescription"> Import description<br></div>






                </div>



            </div>



            <?php

                }

                /**
                 * Helper-function outputs the correct form element (input tag, select tag) for the given item
                 * @param  $aOptionKey string name of the option (un-prefixed)
                 * @param  $aOptionMeta mixed meta-data for $aOptionKey (either a string display-name or an array(display-name, option1, option2, ...)
                 * @param  $savedOptionValue string current value for $aOptionKey
                 * @return void
                 */
                protected function createFormControl($aOptionKey, $aOptionMeta, $savedOptionValue)
                {
                    if (is_array($aOptionMeta) && count($aOptionMeta) >= 2) { // Drop-down list
                        $choices = array_slice($aOptionMeta, 1);
                        ?>
                <p><select name="<?php echo $aOptionKey ?>" id="<?php echo $aOptionKey ?>">
                        <?php
                                    foreach ($choices as $aChoice) {
                                        $selected = ($aChoice == $savedOptionValue) ? 'selected' : '';
                                        ?>
                            <option value="<?php echo $aChoice ?>" <?php echo $selected ?>><?php echo $this->getOptionValueI18nString($aChoice) ?></option>
                        <?php
                                    }
                                    ?>
                    </select></p>
            <?php

                    } else { // Simple input field
                        ?>
                <p><input type="text" name="<?php echo $aOptionKey ?>" id="<?php echo $aOptionKey ?>" value="<?php echo esc_attr($savedOptionValue) ?>" size="50" /></p>
        <?php

                }
            }

            /**
             * Override this method and follow its format.
             * The purpose of this method is to provide i18n display strings for the values of options.
             * For example, you may create a options with values 'true' or 'false'.
             * In the options page, this will show as a drop down list with these choices.
             * But when the the language is not English, you would like to display different strings
             * for 'true' and 'false' while still keeping the value of that option that is actually saved in
             * the DB as 'true' or 'false'.
             * To do this, follow the convention of defining option values in getOptionMetaData() as canonical names
             * (what you want them to literally be, like 'true') and then add each one to the switch statement in this
             * function, returning the "__()" i18n name of that string.
             * @param  $optionValue string
             * @return string __($optionValue) if it is listed in this method, otherwise just returns $optionValue
             */
            protected function getOptionValueI18nString($optionValue)
            {
                switch ($optionValue) {
                    case 'true':
                        return __('true', 'woocommerce-amazon-dropshipping');
                    case 'false':
                        return __('false', 'woocommerce-amazon-dropshipping');

                    case 'Administrator':
                        return __('Administrator', 'woocommerce-amazon-dropshipping');
                    case 'Editor':
                        return __('Editor', 'woocommerce-amazon-dropshipping');
                    case 'Author':
                        return __('Author', 'woocommerce-amazon-dropshipping');
                    case 'Contributor':
                        return __('Contributor', 'woocommerce-amazon-dropshipping');
                    case 'Subscriber':
                        return __('Subscriber', 'woocommerce-amazon-dropshipping');
                    case 'Anyone':
                        return __('Anyone', 'woocommerce-amazon-dropshipping');
                }
                return $optionValue;
            }

            /**
             * Query MySQL DB for its version
             * @return string|false
             */
            protected function getMySqlVersion()
            {
                global $wpdb;
                $rows = $wpdb->get_results('select version() as mysqlversion');
                if (!empty($rows)) {
                    return $rows[0]->mysqlversion;
                }
                return false;
            }

            /**
             * If you want to generate an email address like "no-reply@your-site.com" then
             * you can use this to get the domain name part.
             * E.g.  'no-reply@' . $this->getEmailDomain();
             * This code was stolen from the wp_mail function, where it generates a default
             * from "wordpress@your-site.com"
             * @return string domain name
             */
            public function getEmailDomain()
            {
                // Get the site domain and get rid of www.
                $sitename = strtolower($_SERVER['SERVER_NAME']);
                if (substr($sitename, 0, 4) == 'www.') {
                    $sitename = substr($sitename, 4);
                }
                return $sitename;
            }
        }

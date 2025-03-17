### Heya This is the CSS Who Done It repo

This is collection of scripts that get all CSS Spec sheets form the W3C and scarpes them for important info.
It will also act as a API for others wanting easy infomation on W3C Css spec sheets

Its done in Deno because that seemed fun


#### Data this Returns
- Authors/ Editors and their affiliation
- The Props defined by the spec
- The abstract
- The Title
- The Date of publication (as listed on the spec)
- The Specs URL 


More info at:

[https://pzwiki.wdka.nl/mediadesign/A_css_who_done_it](https://pzwiki.wdka.nl/mediadesign/A_css_who_done_it)

#### Running it get all the Specs info

To Run it make sure you have deno installed:
(I reccommend the brew method for mac)

[https://docs.deno.com/runtime/getting_started/installation/](https://docs.deno.com/runtime/getting_started/installation/)


##### Step 1:

Scrape to get all W3C Css spec sheet urls

``` deno run -A getSpecs.ts  ```

##### Step 2:

Scrape all info From all scraped spec sheet urls

``` deno run -A getSpecInfo.ts  ```

This has fun options to help with debugging

Scrape random number of sheets to test

``` test + number(default = 10) of sheets to test  ```
``` e.g deno run -A getSpecInfo.ts test 250 ```

Scrape data for just one spec sheet

``` spec + spec sheet url ```
``` e.g deno run -A getSpecInfo.ts spec https://www.w3.org/TR/CSS2/ ```

Scrape data for a number of sheets between two numbers in sequence

``` from + start + end ```
``` e.g deno run -A getSpecInfo.ts from 120 350 ```

Scrape the last selction of sheets run

``` old ```
``` e.g deno run -A getSpecInfo.ts old ```

Scrape the current selection of broken/failed sheets

``` broken ```
``` e.g deno run -A getSpecInfo.ts  broken ```


Scrape any of the above for only certain props

``` --focus= "all|authors|editors|date|url|name|type|props|abstract|terms"(default = all)```
``` e.g deno run -A getSpecInfo.ts  broken ```



###links for different docs###
[https://www.w3.org/TR/css-grid-2/](https://www.w3.org/TR/css-grid-2/) 
[https://www.w3.org/TR/2017/WD-css-logical-1-20170518/](https://www.w3.org/TR/2017/WD-css-logical-1-20170518/) 

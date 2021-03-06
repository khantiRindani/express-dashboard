const express = require('express');
const router = express.Router();

/* GET home page. */
const controller = require("../controllers/controller");
const {readSites,readSitesWithCategory} = require("../utils/siteList");

const farFuture = new Date(new Date().getTime() + (1000*60*60*24*365*10)); // ~10y

//Default Home
router.get('/', function(req, res, next) {
    controller.loadOrRetrieveCookies(req,res);
    res.render('dashboard');
});

//Thumbnail View: with tiles
router.get('/thumb', function(req, res, next) {
    controller.loadOrRetrieveCookies(req,res);
    res.render('dashboardThumb');
});

//Category classified view
router.get('/categories', function(req, res, next) {
    controller.loadOrRetrieveCookies(req,res);
    res.render('dashboardCat');
});

//Request for getting new images (First time load or Addition of a new site)
router.get('/getImages', function(req, res, next) {
    let sites = req.cookies.sites;
    res.json(sites);
});

//Request for images with category
router.get('/getImagesCat', function(req, res, next) {
    const sitesCat = req.cookies.sitesCat;
    res.json(sitesCat);
});

router.get('/captureImages', function(req,res,next){
    let sites = req.cookies.sites;
    for(site of sites){
        controller.captureImage(site,req.cookies.io);
    }
    res.end("done");
});
//API for adding a new site via form POST method
router.post('/addSite*', function(req,res){
    const sitesCat = req.cookies.sitesCat;
    const sites = req.cookies.sites;

    let name = req.body.site;
    const newSiteCap = {
        "site_name": name,
        "url": req.body.url
    };
    const cat = (req.body.cat?req.body.cat:'general');

    const newSite = {
        "site_name": name,
        "url": req.body.url,
        "cat": cat
    };
    controller.captureImage(newSiteCap,req.cookies.io).then(()=>{io.to(req.cookies.io).emit('Image',{'site': newSiteCap});});
    sitesCat.push(newSite);
    sites.push(newSiteCap);
    res.cookie('sitesCat', sitesCat, {expires: farFuture});
    res.cookie('sites',sites,{expires: farFuture});
    res.end("Done");
});

//API for deleting a site
router.delete('/delete*',function(req,res){
    const delSite = req.body.site;
    let sites = req.cookies.sites;
    let sitesCat = req.cookies.sitesCat;
    for(var i=0; i<sites.length; i++){
        if(sites[i].site_name === delSite)
            break;
    }
    sites.splice(i,1);
    sitesCat.splice(i,1);
    res.cookie('sites', sites, {expires: farFuture});
    res.cookie('sitesCat', sitesCat, {expires: farFuture});
    res.json(sitesCat);
});

module.exports = router;

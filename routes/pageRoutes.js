const express = require("express");
const router = express.Router();

router.get("/help-center", (req, res) => {
    res.render("pages/help-center");
});

router.get("/contact", (req, res) => {
    res.render("pages/contact");
});

router.get("/safety-information", (req, res) => {
    res.render("pages/safety-information");
});

router.get("/cancellation-policy", (req, res) => {
    res.render("pages/cancellation-policy");
});

router.get("/faqs", (req, res) => {
    res.render("pages/faqs");
});

router.get("/hosting-guide", (req, res) => {
    res.render("pages/hosting-guide");
});

router.get("/host-resources", (req, res) => {
    res.render("pages/host-resources");
});

router.get("/community-forum", (req, res) => {
    res.render("pages/community-forum");
});

router.get("/responsible-hosting", (req, res) => {
    res.render("pages/responsible-hosting");
});

router.get("/about-us", (req, res) => {
    res.render("pages/about-us");
});

router.get("/trust-and-safety", (req, res) => {
    res.render("pages/trust-safety");
});

router.get("/privacy-policy", (req, res) => {
    res.render("pages/privacy-policy");
});

router.get("/terms-conditions", (req, res) => {
    res.render("pages/terms-conditions");
});

module.exports = router;

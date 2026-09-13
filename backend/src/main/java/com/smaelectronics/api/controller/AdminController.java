package com.smaelectronics.api.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    // The login page calls this with the entered credentials.
    // If they're wrong, Spring Security itself blocks the request with 401
    // before this method ever runs. If it returns 200, the login is valid.
    @GetMapping("/check")
    public String checkLogin() {
        return "ok";
    }

}

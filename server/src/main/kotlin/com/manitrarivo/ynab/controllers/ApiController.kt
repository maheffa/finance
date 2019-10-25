package com.manitrarivo.ynab.controllers

import com.manitrarivo.ynab.data.Greeting
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@CrossOrigin(origins = ["*"], allowedHeaders = ["*"])
@RestController
@RequestMapping("api")
class ApiController {

    @GetMapping("/hello")
    fun hello() = Greeting("Boo")
}
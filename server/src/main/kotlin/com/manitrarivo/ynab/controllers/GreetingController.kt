package com.manitrarivo.ynab.controllers

import com.manitrarivo.ynab.data.Greeting
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.atomic.AtomicLong

@RestController
class GreetingController {

    val counter = AtomicLong()

    @GetMapping("/greeting")
    fun greeting(
            @RequestParam(value = "name", defaultValue = "World") name: String,
            @RequestParam(value = "dodo", defaultValue = "ha") dodo: String
    ) = Greeting(counter.incrementAndGet(), "Hi, $name $dodo")

}
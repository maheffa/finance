package com.manitrarivo.ynab.controllers

import com.manitrarivo.ynab.data.db.User
import com.manitrarivo.ynab.data.db.UserRepository
import com.manitrarivo.ynab.data.request.UserCreateRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@CrossOrigin(origins = ["*"], allowedHeaders = ["*"])
@RestController
@RequestMapping("api/user")
class UserController {
    @Autowired
    private lateinit var userRepository: UserRepository

    @GetMapping("/users")
    fun getUsers() = this.userRepository.findAll().toList()

    @PostMapping("/create")
    fun createUser(@RequestBody createRequest: UserCreateRequest) = this.userRepository.save(User(createRequest.name))
}
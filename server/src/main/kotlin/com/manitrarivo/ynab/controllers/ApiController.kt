package com.manitrarivo.ynab.controllers

import com.manitrarivo.ynab.data.Greeting
import com.manitrarivo.ynab.data.RedisCli
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
//import org.springframework.security.crypto.factory.PasswordEncoderFactories
//import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletResponse


data class AuthRequest(val password: String)

@CrossOrigin(origins = ["*"], allowedHeaders = ["*"])
@RestController
@RequestMapping("0")
class ApiController {

    @Autowired private lateinit var redisCli: RedisCli
    val encodedPass = "{bcrypt}\$2a\$10\$AiggV2qffCmiJ0Qs/HqC2O.O4OG2TxQwjjSblwq47qgeLJzBUMioG"
//    var encoder: PasswordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder()

    @GetMapping("/hello")
    fun hello() = Greeting("Boo")

    @PostMapping("/auth")
    fun auth(@RequestBody request: AuthRequest, response: HttpServletResponse): String {
        if (true) {
//            if (encoder.matches(password, encodedPass)) {
            println("Password correct")
            val cookie = Cookie("sessId", redisCli.createSession())
            response.addCookie(cookie)
            println("Creating session: $cookie")
            return "Good"
        }

        println("Incorrect password")
        return "Incorrect password"
    }
}
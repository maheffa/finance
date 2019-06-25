package com.manitrarivo.ynab.controllers

import com.manitrarivo.ynab.data.Greeting
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("api")
class ApiController {

//    @Autowired
//    lateinit var fileStorage: FileStorage

    @GetMapping("/hello")
    fun hello() = Greeting("Boo")

    @PostMapping("/upload/test")
    fun uploadMultipartFile(@RequestParam("uploadfile") file: MultipartFile, model: Model): String {
//        fileStorage.store(file);
        model.addAttribute(
                "message",
                "File started with (100 chars): " + String(file.bytes.take(100).toByteArray()))
        return "uploadform.html"
    }
}
package com.manitrarivo.ynab.controllers

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.multipart.MultipartFile

@Controller
@RequestMapping("/upload")
class UploadFileController {

//    @Autowired
//    lateinit var fileStorage: FileStorage

    @GetMapping("/test")
    fun index(): String {
        return "uploadform.html"
    }

    @PostMapping("/test")
    fun uploadMultipartFile(@RequestParam("uploadfile") file: MultipartFile, model: Model): String {
//        fileStorage.store(file);
        model.addAttribute(
                "message",
                "File started with (100 chars): " + String(file.bytes.take(100).toByteArray()))
        return "uploadform.html"
    }
}
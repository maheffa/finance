package com.manitrarivo.ynab.controllers

import com.manitrarivo.ynab.converters.AbnConverter
import com.manitrarivo.ynab.converters.TransactionLog
import com.manitrarivo.ynab.data.Greeting
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@CrossOrigin(origins = ["*"], allowedHeaders = ["*"])
@RestController
@RequestMapping("api")
class ApiController {

//    @Autowired
//    lateinit var fileStorage: FileStorage

    @GetMapping("/hello")
    fun hello() = Greeting("Boo")

    @PostMapping("/upload/abn")
    fun uploadMultipartFile(@RequestParam("transactions") file: MultipartFile, model: Model): ArrayList<TransactionLog> {
        return AbnConverter().convert(file.inputStream)
    }
}
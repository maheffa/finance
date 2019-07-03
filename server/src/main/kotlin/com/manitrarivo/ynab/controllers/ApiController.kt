package com.manitrarivo.ynab.controllers

import com.manitrarivo.ynab.converters.*
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

    @PostMapping("/parser/revolut")
    fun parseRevolutFile(@RequestParam("transactions") file: MultipartFile): ArrayList<TransactionLog> =
            RevolutConverter().convert(file.inputStream)

    @PostMapping("/parser/abn")
    fun parseAbnFile(@RequestParam("transactions") file: MultipartFile): ArrayList<TransactionLog> =
            AbnConverter().convert(file.inputStream)
}
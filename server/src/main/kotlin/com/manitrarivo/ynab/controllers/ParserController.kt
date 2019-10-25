package com.manitrarivo.ynab.controllers

import com.manitrarivo.ynab.converters.AbnConverter
import com.manitrarivo.ynab.converters.IcsConverter
import com.manitrarivo.ynab.converters.RevolutConverter
import com.manitrarivo.ynab.converters.TransactionLog
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@CrossOrigin(origins = ["*"], allowedHeaders = ["*"])
@RestController
@RequestMapping("api/parser")
class ParserController {

    @PostMapping("/revolut")
    fun parseRevolutFile(@RequestParam("transactions") file: MultipartFile): ArrayList<TransactionLog> =
        RevolutConverter().convert(file.inputStream)

    @PostMapping("/abn")
    fun parseAbnFile(@RequestParam("transactions") file: MultipartFile): ArrayList<TransactionLog> =
        AbnConverter().convert(file.inputStream)

    @PostMapping("/ics")
    fun parseIcsFile(@RequestParam("transactions") file: MultipartFile): ArrayList<TransactionLog> =
        IcsConverter().convert(file.inputStream)
}
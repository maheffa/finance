package com.manitrarivo.ynab.controllers

import com.manitrarivo.ynab.business.converters.AbnConverter
import com.manitrarivo.ynab.business.converters.IcsConverter
import com.manitrarivo.ynab.business.converters.RevolutConverter
import com.manitrarivo.ynab.business.converters.TransactionLog
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
    fun parseRevolutFile(@RequestParam("transactionsFile") file: MultipartFile): List<TransactionLog> =
        RevolutConverter().convert(file.inputStream)

    @PostMapping("/abn")
    fun parseAbnFile(@RequestParam("transactionsFile") file: MultipartFile): List<TransactionLog> =
        AbnConverter().convert(file.inputStream)

    @PostMapping("/ics")
    fun parseIcsFile(@RequestParam("transactionsFile") file: MultipartFile): List<TransactionLog> =
        IcsConverter().convert(file.inputStream)
}
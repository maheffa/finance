package com.manitrarivo.ynab

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class YnabApplication

fun main(args: Array<String>) {
	runApplication<YnabApplication>(*args)
}

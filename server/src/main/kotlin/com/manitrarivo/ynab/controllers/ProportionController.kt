package com.manitrarivo.ynab.controllers

import com.manitrarivo.ynab.business.calculateProportion
import com.manitrarivo.ynab.data.RequestAction
import com.manitrarivo.ynab.data.db.Proportion
import com.manitrarivo.ynab.data.db.ProportionRepository
import com.manitrarivo.ynab.data.db.TransactionRepository
import com.manitrarivo.ynab.data.db.UserRepository
import com.manitrarivo.ynab.data.request.ProportionRequest
import com.manitrarivo.ynab.data.request.ProportionResponse
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime


@CrossOrigin(origins = ["*"], allowedHeaders = ["*"])
@RestController
@RequestMapping("api/proportion")
class ProportionController {
    @Autowired
    private lateinit var transactionRepository: TransactionRepository
    @Autowired
    private lateinit var proportionRepository: ProportionRepository
    @Autowired
    private lateinit var userRepository: UserRepository

    val logger = LogManager.getLogger(ProportionController::class)

    @GetMapping("/details")
    fun detailedAdjustments(@RequestParam("from") from: String?, @RequestParam("to") to: String?): List<List<ProportionResponse>> {
        val toDate = parseDate(to, LocalDateTime.now())
        val fromDate = parseDate(from, LocalDateTime.now().minusDays(30))
        val rawTransactions = when {
            from != null && to != null -> transactionRepository.findAllByDateBetween(fromDate, toDate)
            from != null -> transactionRepository.findAllByDateAfter(fromDate)
            to != null -> transactionRepository.findAllByDateBefore(toDate)
            else -> transactionRepository.findAll()
        }

        return calculateProportion(
            userRepository.findAll().filterNotNull(),
            proportionRepository.findAll().filterNotNull(),
            rawTransactions.toList()
        )
    }

    @GetMapping("/read")
    fun readProportions() = proportionRepository.findAll().toList()

    @PostMapping("/action")
    fun proportionActionRequest(@RequestBody proportionRequest: ProportionRequest): List<Proportion> {
        val res = when {
            proportionRequest.actionType == RequestAction.CREATE -> {
                proportionRequest.proportions.map { proportionRepository.save(Proportion(it.user, it.month, it.year, it.amount)) }
            }
            proportionRequest.actionType == RequestAction.UPDATE -> {
                proportionRequest.proportions.map { proportionRepository.save(it) }
            }
            proportionRequest.actionType == RequestAction.DELETE -> {
                val existings = proportionRepository.findAllById(proportionRequest.proportions.map { it.id }).toList()
                proportionRepository.deleteAll(existings)
                existings
            }
            else -> listOf()
        }

        return res
    }
}

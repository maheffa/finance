package com.manitrarivo.ynab.services

import com.manitrarivo.ynab.data.db.CombinedTransactionCategoryRepository
import com.manitrarivo.ynab.data.db.CombinedTransactionPayeeRepository
import com.manitrarivo.ynab.data.db.CombinedTransactionRepository
import com.manitrarivo.ynab.data.db.ContributionRepository
import com.manitrarivo.ynab.data.db.OweTransactionRepository
import com.manitrarivo.ynab.data.db.PaybackTransactionRepository
import com.manitrarivo.ynab.data.db.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class CombinedTransactionService @Autowired constructor(
        private val combinedTransactionRepository: CombinedTransactionRepository,
        private val combinedTransactionCategoryRepository: CombinedTransactionCategoryRepository,
        private val combinedTransactionPayeeRepository: CombinedTransactionPayeeRepository,
        private val contributionRepository: ContributionRepository,
        private val oweTransactionRepository: OweTransactionRepository,
        private val paybackTransactionRepository: PaybackTransactionRepository,
        private val userRepository: UserRepository
) {
}

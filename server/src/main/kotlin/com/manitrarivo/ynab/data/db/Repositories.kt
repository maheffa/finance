package com.manitrarivo.ynab.data.db

import org.springframework.data.repository.CrudRepository

interface CombinedTransactionRepository: CrudRepository<CombinedTransaction, Int>
interface CombinedTransactionCategoryRepository: CrudRepository<CombinedTransactionCategory, Int>
interface CombinedTransactionPayeeRepository: CrudRepository<CombinedTransactionPayee, Int>
interface ContributionRepository: CrudRepository<ContributionRepository, Int>
interface OweTransactionRepository: CrudRepository<OweTransaction, Int>
interface PaybackTransactionRepository: CrudRepository<PaybackTransaction, Int>
interface UserRepository: CrudRepository<User, Int>
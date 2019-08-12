package com.manitrarivo.ynab.data.db

import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id

@Entity
class CombinedTransactionCategory (
    @Column
    val name: String
) {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0

//  @OneToMany(mappedBy = "associatedCategory", cascade = [CascadeType.ALL])
//  val payees: Set<CombinedTransactionPayee>
}

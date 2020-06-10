package com.manitrarivo.ynab.data.request

import com.manitrarivo.ynab.data.RequestAction
import com.manitrarivo.ynab.data.db.Proportion
import com.manitrarivo.ynab.data.db.User

data class ProportionResponse (
    var user: User,
    var paid: Double,
    var adjustment: Double,
    var month: Int,
    var year: Int,
    var comp: Double,
    var totalComp: Double
)

data class ProportionRequest (
    val proportions: List<Proportion>,
    val actionType: RequestAction
)
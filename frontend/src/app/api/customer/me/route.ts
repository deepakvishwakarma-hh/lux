// create get api to fetch customer data 
import { NextRequest, NextResponse } from "next/server"
import { retrieveCustomer } from "@lib/data/customer"

export async function GET(request: NextRequest) {
    const customer = await retrieveCustomer()
    return NextResponse.json(customer)
}   
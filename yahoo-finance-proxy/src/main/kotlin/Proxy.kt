import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

val client = HttpClient(CIO)

fun main() {
    embeddedServer(Netty, port = 8081) {
        install(CORS) {
            anyHost()
            allowMethod(HttpMethod.Get)
        }
        routing {
            get("/quote/{ticker}") {
                val ticker = call.parameters["ticker"] ?: return@get call.respond(HttpStatusCode.BadRequest)
                val range = call.request.queryParameters["range"] ?: "5y"
                val url = "https://query1.finance.yahoo.com/v8/finance/chart/$ticker?interval=1d&range=$range&includePrePost=false"
                try {
                    val resp = client.get(url) {
                        header("User-Agent", "Mozilla/5.0")
                    }
                    val body = resp.bodyAsText()
                    call.respondText(body, ContentType.Application.Json, resp.status)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.BadGateway, e.message ?: "upstream error")
                }
            }
        }
    }.start(wait = true)
}

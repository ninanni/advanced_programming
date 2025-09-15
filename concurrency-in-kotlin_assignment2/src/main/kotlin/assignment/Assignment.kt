package assignment

import exercises.e3.AsyncAwait.setInterval
import exercises.e3.AsyncAwait.async
import kotlinx.coroutines.ObsoleteCoroutinesApi
import kotlinx.coroutines.channels.SendChannel
import labutils.*
import labutils.math.Point
import labutils.robot.RobotBehavior
import labutils.simulator.Simulator.Companion.actor
import java.awt.Color

fun main() {
    Scenarios.Assignment.runScenario(
        redBehavior = Assignment.redBehavior,
        greenBehavior = Assignment.greenBehavior,
        blueBehavior = Assignment.blueBehavior,
        width = 600.0,
        height = 600.0,
    )
}

@OptIn(ObsoleteCoroutinesApi::class)
object Assignment {
    // SCENARIO
    // Three colored robots wants to reach the light of their own color:
    // - The red robot wants to reach the red light.
    // - The blue robot wants to reach the blue light.
    // - The green robot wants to reach the green light.
    // Their light sensors can only detect the closest light, which may
    // have a different color than their own. In fact, each robot starts
    // closest to a light with a different color:
    // - The red robot starts near the blue light
    // - The green robot starts near the red light
    // - the blue robot start near the green light
    // The robots must exchange messages to share local information about
    // the environment and achieved their own goals.
    // The robots should also exchange messages about their goals. In
    // particular, only after all three robots have reached their goal,
    // they all start blinking.

    // CHANNELS
    private val robotIds: List<Color> = listOf(Color.RED, Color.GREEN, Color.BLUE)
    private val channels: MutableMap<Color, SendChannel<Message>> = mutableMapOf()

    // MESSAGES
    private sealed class Message
    private data class LightPosition(val position: Point) : Message()
    private data object ReachedLight : Message()

    // GENERATE BEHAVIOR
    private fun generateBehavior(color: Color):RobotBehavior = { robot ->
        var reachedLightRobots = 0 // how many robots reached their goal
        var reachedLight = false // whether this robot reached its goal
        var lightPosition = Point(0.0, 0.0) // location of this robot's light

        // We know from the initial state that each robot is positioned at a different light that is not of their own color
        // Then find the closest light and send the robot with the corresponding color the position
        val findLight = async {
            val closestLight = robot.lightSensor.closestLight()
            if (closestLight != null) {
                channels[closestLight.color]?.send(LightPosition(robot.body.absolutePosition(closestLight.direction)))
            }
        }

        // Move towards the light until it is reached, if reached notify all
         val moveToLight = setInterval(10){
            val lightDirection = robot.body.relativeDirection(lightPosition)
            // When light is reached, adjust rotation according to figure shown in assignment PDF, then send message to all robots
            if (lightDirection.length < 1e-14 && !reachedLight){ // if robot is the first time on the light
                reachedLight = true
                robot.spinMotor.rotate(-robot.body.angle + 180) // rotate to 180° orientation as shown in assignment, comment out if this behavior is not wanted
                for (id in robotIds) {
                    channels[id]?.send(ReachedLight)
                }
            }else {
                if (!reachedLight){ // move towards light if not already reached
                    val move = async { robot.motor.forward(lightDirection.length) }
                    val rotate = async {robot.spinMotor.rotate(lightDirection.angle) }
                }
            }
         }

        channels[color] = actor {
            for (msg in channel) {
                when (msg) {
                    is LightPosition -> {
                        lightPosition = msg.position // set position of own light
                    }
                    is ReachedLight -> {
                        reachedLightRobots += 1 // one more robot finished
                        if (reachedLightRobots == robotIds.size) { // start blinking if all finished
                            val blinking = setInterval(500){
                                robot.led.switch(on = !robot.led.isLit())
                            }
                        }
                    }
                }
            }
        }
    }

    // BEHAVIORS
    val redBehavior: RobotBehavior = generateBehavior(robotIds[0])
    val greenBehavior: RobotBehavior = generateBehavior(robotIds[1])
    val blueBehavior: RobotBehavior = generateBehavior(robotIds[2])
}
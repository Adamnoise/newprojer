import type { Alert, PatternAnalysisResult } from "./types"

export class AlertService {
  private alerts: Alert[] = []

  /**
   * Adds an alert to the service
   */
  public addAlert(alert: Alert): void {
    this.alerts.push(alert)
  }

  /**
   * Removes an alert from the service
   */
  public removeAlert(alertId: string): void {
    this.alerts = this.alerts.filter((alert) => alert.id !== alertId)
  }

  /**
   * Updates an existing alert
   */
  public updateAlert(updatedAlert: Alert): void {
    this.alerts = this.alerts.map((alert) => (alert.id === updatedAlert.id ? updatedAlert : alert))
  }

  /**
   * Gets all alerts
   */
  public getAlerts(): Alert[] {
    return [...this.alerts]
  }

  /**
   * Gets alerts for a specific pattern
   */
  public getAlertsForPattern(patternId: string): Alert[] {
    return this.alerts.filter((alert) => alert.patternId === patternId)
  }

  /**
   * Checks if any alerts should be triggered based on analysis results
   */
  public checkAlerts(results: Record<string, PatternAnalysisResult>): Alert[] {
    const triggeredAlerts: Alert[] = []

    this.alerts.forEach((alert) => {
      if (!alert.isActive) return

      const result = results[alert.patternId]
      if (!result) return

      const shouldTrigger = alert.conditions.every((condition) => {
        switch (condition.type) {
          case "frequency":
            return this.evaluateCondition(condition, result.frequency)

          case "confidence":
            // Use average confidence of occurrences
            const avgConfidence =
              result.occurrenceDetails.reduce((sum, occurrence) => sum + occurrence.confidence, 0) /
              result.occurrenceDetails.length

            return this.evaluateCondition(condition, avgConfidence)

          case "occurrence_count":
            return this.evaluateCondition(condition, result.occurrences)

          default:
            return false
        }
      })

      if (shouldTrigger) {
        // Update last triggered time
        alert.lastTriggered = new Date().toISOString()
        triggeredAlerts.push(alert)

        // Execute alert actions
        this.executeAlertActions(alert, result)
      }
    })

    return triggeredAlerts
  }

  /**
   * Evaluates a condition against a value
   */
  private evaluateCondition(condition: any, value: number): boolean {
    switch (condition.operator) {
      case "=":
        return value === condition.value
      case "!=":
        return value !== condition.value
      case ">":
        return value > condition.value
      case "<":
        return value < condition.value
      case ">=":
        return value >= condition.value
      case "<=":
        return value <= condition.value
      default:
        return false
    }
  }

  /**
   * Executes actions for a triggered alert
   */
  private executeAlertActions(alert: Alert, result: PatternAnalysisResult): void {
    alert.actions.forEach((action) => {
      switch (action.type) {
        case "email":
          // This would be implemented with an email service
          console.log(`Sending email alert for pattern ${result.patternName}`)
          break

        case "notification":
          // This would trigger an in-app notification
          console.log(`Sending notification for pattern ${result.patternName}`)
          break

        case "webhook":
          // This would call a webhook URL
          if (action.config.url) {
            fetch(action.config.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                alert: alert.name,
                pattern: result.patternName,
                occurrences: result.occurrences,
                frequency: result.frequency,
                timestamp: new Date().toISOString(),
              }),
            }).catch((error) => {
              console.error("Error sending webhook:", error)
            })
          }
          break
      }
    })
  }
}

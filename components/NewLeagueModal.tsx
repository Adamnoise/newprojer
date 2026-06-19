"use client"

import { useCallback, useState } from "react"
import { Plus } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  leagueId: z
    .string()
    .min(3, "League ID must be at least 3 characters")
    .max(50, "League ID must be less than 50 characters")
    .regex(/^[a-zA-Z0-9-_]+$/, "League ID can only contain letters, numbers, hyphens, and underscores")
    .trim(),
})

type FormValues = z.infer<typeof formSchema>

interface NewLeagueModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateLeague: (leagueId: string) => Promise<void>
}

export function NewLeagueModal({ isOpen, onClose, onCreateLeague }: NewLeagueModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leagueId: "",
    },
  })

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      try {
        setIsSubmitting(true)
        await onCreateLeague(values.leagueId)
        form.reset()
        onClose()
      } catch (error) {
        form.setError("leagueId", {
          type: "manual",
          message: error instanceof Error ? error.message : "Failed to create league",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [onCreateLeague, onClose, form],
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#0a0f14] border border-white/5 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Create New League</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the ID for the new league. The name will be automatically generated.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="leagueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">League ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter league ID..."
                      disabled={isSubmitting}
                      className="font-mono bg-black/30 border-white/10 text-white focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2 bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-4 w-4" />
                Create League
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

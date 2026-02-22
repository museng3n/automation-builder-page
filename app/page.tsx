"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/shared-api-config/api/client"
import ENDPOINTS from "@/shared-api-config/api/endpoints"
import { isAuthenticated } from "@/shared-api-config/utils/auth"
import { URLS } from "@/shared-api-config/api/config"

type Trigger = {
  id: string
  nameAr: string
  nameEn: string
  accuracy: string
  isAdvanced?: boolean
}

type Condition = {
  id: string
  platform: string
  interactionType: string
  count: number
  timePeriod: string
  connector?: "AND" | "OR"
}

// Updated Action type
type Action = {
  id: string
  type: "dm" | "auto_reply" | "save_contact" | "add_tag"
  message?: string
  category?: string
  tagName?: string
}

type Milestone = {
  id: string
  metric: string
  threshold: number
  message: string
}

const primaryTriggers: Trigger[] = [
  { id: "comment", nameAr: "تعليق جديد", nameEn: "New Comment", accuracy: "95-100% دقيقة" },
  { id: "story_reply", nameAr: "رد على ستوري", nameEn: "Story Reply", accuracy: "100% دقيقة" },
  { id: "story_mention", nameAr: "ذكر في ستوري", nameEn: "Story Mention", accuracy: "100% دقيقة" },
  { id: "dm", nameAr: "رسالة خاصة", nameEn: "DM", accuracy: "100% دقيقة" },
  { id: "email_open", nameAr: "فتح بريد", nameEn: "Email Opened", accuracy: "100% دقيقة" },
  { id: "email_click", nameAr: "نقر على رابط", nameEn: "Email Clicked", accuracy: "100% دقيقة" },
]

const advancedTriggers: Trigger[] = [
  { id: "follow", nameAr: "متابعة جديدة", nameEn: "New Follow", accuracy: "90% دقيقة", isAdvanced: true },
  { id: "share", nameAr: "مشاركة بوست", nameEn: "Post Share", accuracy: "100% دقيقة", isAdvanced: true },
  { id: "save", nameAr: "حفظ البوست", nameEn: "Save Post", accuracy: "90-95% دقيقة", isAdvanced: true },
  { id: "like", nameAr: "إعجاب بوست", nameEn: "Like Post", accuracy: "70-80% دقيقة", isAdvanced: true },
]

const stages = [
  "Contact",
  "Engager",
  "Subscriber",
  "Messager",
  "Lead",
  "MQL",
  "SQL",
  "Customer",
  "Upseller",
  "Downseller",
]

const interactionTypes = [
  { value: "comment", labelAr: "تعليق على البوست", labelEn: "Comment on Post" },
  { value: "save", labelAr: "حفظ البوست", labelEn: "Save Post" },
  { value: "share", labelAr: "مشاركة البوست", labelEn: "Share Post" },
  { value: "follow", labelAr: "متابعة جديدة", labelEn: "New Follow" },
  { value: "like", labelAr: "إعجاب على البوست", labelEn: "Like Post" },
]

export default function AutomationBuilderPage() {
  const [ruleName, setRuleName] = useState("قاعدة جديدة - فاعل Instagram")
  const [description, setDescription] = useState("عند حفظ والتعليق على البوست، يتم ترقيته من Contact إلى Lead")
  const [triggerWord, setTriggerWord] = useState("مهتم")
  const [excludedWords, setExcludedWords] = useState("غير مهتم، لا أريد")
  const [similarWords, setSimilarWords] = useState<string[]>(["مهتمة", "أريد", "أبغى", "أرغب"])
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(["comment"])
  const [instagramPosts, setInstagramPosts] = useState<string[]>(["Post 1", "Post 2"])
  const [facebookPosts, setFacebookPosts] = useState<string[]>([])
  const [conditionsEnabled, setConditionsEnabled] = useState(true)
  const [conditions, setConditions] = useState<Condition[]>([
    { id: "1", platform: "instagram", interactionType: "save", count: 1, timePeriod: "week", connector: "AND" },
    { id: "2", platform: "instagram", interactionType: "comment", count: 1, timePeriod: "week" },
  ])
  // Updated actions state with new types
  const [actions, setActions] = useState<Action[]>([
    { id: "1", type: "dm", message: "شكراً لاهتمامك! سنرسل لك تفاصيل المنتج..." },
    { id: "2", type: "save_contact", category: "حفظ الفيديو" },
  ])
  const [milestonesEnabled, setMilestonesEnabled] = useState(true)
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "1", metric: "clicks", threshold: 1, message: "جيداً! إنها بداية سنساوى معنا بهذا" },
    { id: "2", metric: "clicks", threshold: 5, message: "برافو! 5 أشخاص دخلوا - مع دخمك SHARES بالإنستغرام" },
    { id: "3", metric: "clicks", threshold: 10, message: "تميّز 10! الفتاح - مشاهده خاصة بالانتقال" },
  ])

  const [saving, setSaving] = useState(false)
  const [loadingRule, setLoadingRule] = useState(false)
  const [ruleId, setRuleId] = useState<string | null>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    if (urlToken) {
      localStorage.setItem('triggerio_token', urlToken)
    }
    const id = urlParams.get('ruleId')
    if (id) {
      setRuleId(id)
    }
    // Clean URL but preserve params for reload
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = URLS.AUTH
    }
  }, [])

  useEffect(() => {
    if (!ruleId) return
    const loadRule = async () => {
      try {
        setLoadingRule(true)
        const response = await apiClient.get(ENDPOINTS.AUTOMATION.BY_ID(ruleId))
        const rule = response.data?.data || response.data
        if (rule) {
          if (rule.name) setRuleName(rule.name)
          if (rule.description) setDescription(rule.description)
          if (rule.triggerWord) setTriggerWord(rule.triggerWord)
          if (rule.excludedWords) setExcludedWords(Array.isArray(rule.excludedWords) ? rule.excludedWords.join("، ") : rule.excludedWords)
          if (rule.similarWords) setSimilarWords(rule.similarWords)
          if (rule.triggers) setSelectedTriggers(rule.triggers)
          if (rule.instagramPosts) setInstagramPosts(rule.instagramPosts)
          if (rule.facebookPosts) setFacebookPosts(rule.facebookPosts)
          if (rule.conditionsEnabled !== undefined) setConditionsEnabled(rule.conditionsEnabled)
          if (rule.conditions) setConditions(rule.conditions)
          if (rule.actions) setActions(rule.actions)
          if (rule.milestonesEnabled !== undefined) setMilestonesEnabled(rule.milestonesEnabled)
          if (rule.milestones) setMilestones(rule.milestones)
        }
      } catch (err) {
        console.error("Failed to load rule:", err)
      } finally {
        setLoadingRule(false)
      }
    }
    loadRule()
  }, [ruleId])

  const buildRulePayload = () => ({
    name: ruleName,
    description,
    triggerWord,
    excludedWords: excludedWords.split("،").map((w: string) => w.trim()).filter(Boolean),
    similarWords,
    triggers: selectedTriggers,
    instagramPosts,
    facebookPosts,
    conditionsEnabled,
    conditions,
    actions,
    milestonesEnabled,
    milestones,
  })

  const handleSaveDraft = async () => {
    try {
      setSaving(true)
      console.log("Payload:", JSON.stringify(buildRulePayload(), null, 2))
      console.log("Rule ID:", ruleId)
      console.log("Endpoint:", ruleId ? ENDPOINTS.AUTOMATION.BY_ID(ruleId) : ENDPOINTS.AUTOMATION.BASE)
      if (ruleId) {
        await apiClient.put(ENDPOINTS.AUTOMATION.BY_ID(ruleId), {
          ...buildRulePayload(),
          status: "draft",
        })
      } else {
        await apiClient.post(ENDPOINTS.AUTOMATION.BASE, {
          ...buildRulePayload(),
          status: "draft",
        })
      }
      alert("تم الحفظ كمسودة")
    } catch (err: any) {
      console.error("Failed to save draft:", err)
      alert(err.response?.data?.message || "فشل في حفظ المسودة")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAndActivate = async () => {
    try {
      setSaving(true)
      console.log("Payload:", JSON.stringify(buildRulePayload(), null, 2))
      console.log("Rule ID:", ruleId)
      console.log("Endpoint:", ruleId ? ENDPOINTS.AUTOMATION.BY_ID(ruleId) : ENDPOINTS.AUTOMATION.BASE)
      if (ruleId) {
        await apiClient.put(ENDPOINTS.AUTOMATION.BY_ID(ruleId), {
          ...buildRulePayload(),
          status: "active",
        })
      } else {
        await apiClient.post(ENDPOINTS.AUTOMATION.BASE, {
          ...buildRulePayload(),
          status: "active",
        })
      }
      alert("تم حفظ وتفعيل القاعدة")
    } catch (err: any) {
      console.error("Failed to save rule:", err)
      alert(err.response?.data?.message || "فشل في حفظ القاعدة")
    } finally {
      setSaving(false)
    }
  }

  const hasAdvancedTrigger = selectedTriggers.some((id) => advancedTriggers.find((t) => t.id === id))

  const toggleTrigger = (id: string) => {
    setSelectedTriggers((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      platform: "instagram",
      interactionType: "comment",
      count: 1,
      timePeriod: "week",
    }
    setConditions([...conditions, newCondition])
  }

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id))
  }

  // Updated addAction function to handle new action types
  const addAction = (type: Action["type"]) => {
    const newAction: Action = {
      id: Date.now().toString(),
      type,
      ...(type === "dm" && { message: "" }),
      ...(type === "auto_reply" && { message: "" }),
      ...(type === "save_contact" && { category: "" }),
      ...(type === "add_tag" && { tagName: "" }),
    }
    setActions([...actions, newAction])
  }

  const removeAction = (id: string) => {
    setActions(actions.filter((a) => a.id !== id))
  }

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      metric: "clicks",
      threshold: 1,
      message: "",
    }
    setMilestones([...milestones, newMilestone])
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="outline" className="gap-2 bg-transparent">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            رجوع إلى القائمة
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 bg-white" onClick={handleSaveDraft} disabled={saving}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z" />
              </svg>
              {saving ? "جاري الحفظ..." : "حفظ كمسودة"}
            </Button>
            <Button className="gap-2 text-white" style={{ backgroundColor: "#7C3AED" }} onClick={handleSaveAndActivate} disabled={saving}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z" />
              </svg>
              {saving ? "جاري الحفظ..." : "حفظ القاعدة"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-32 space-y-6">
        {/* Section 1: Rule Information */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">معلومات القاعدة</h2>
            <p className="text-sm text-gray-500">Rule Information</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اسم القاعدة *</label>
              <p className="text-xs text-gray-500 mb-2">Rule Name</p>
              <Input
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="مثال: الرد التلقائي على المهتمين"
                className="text-right"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف (اختياري)</label>
              <p className="text-xs text-gray-500 mb-2">Description</p>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="text-right"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Triggers */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">المحفزات *</h2>
            <p className="text-sm text-gray-500 mb-2">Triggers (Required)</p>
            <p className="text-sm text-gray-600">اختر المحفز الذي سيبدأ هذه الأتمتة</p>
          </div>

          {/* Primary Triggers */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">المحفزات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {primaryTriggers.map((trigger) => (
                <div
                  key={trigger.id}
                  onClick={() => toggleTrigger(trigger.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedTriggers.includes(trigger.id)
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{trigger.nameAr}</p>
                      <p className="text-xs text-gray-500">{trigger.nameEn}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedTriggers.includes(trigger.id)}
                      onChange={() => {}}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </div>
                  <p className="text-xs text-gray-600">{trigger.accuracy}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Triggers */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-gray-800">محفزات متقدمة</h3>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                Advanced
              </span>
            </div>
            <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg mb-4">
              هذه المحفزات تحتاج 'تعليق جديد' للعمل بدقة
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advancedTriggers.map((trigger) => (
                <div
                  key={trigger.id}
                  onClick={() => toggleTrigger(trigger.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedTriggers.includes(trigger.id)
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{trigger.nameAr}</p>
                      <p className="text-xs text-gray-500">{trigger.nameEn}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedTriggers.includes(trigger.id)}
                      onChange={() => {}}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </div>
                  <p className="text-xs text-gray-600">{trigger.accuracy}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Locked Comment Field */}
          {hasAdvancedTrigger && (
            <div className="p-4 border-2 border-red-500 rounded-lg bg-red-50 opacity-70 cursor-not-allowed">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="w-5 h-5 text-purple-600 cursor-not-allowed"
                  />
                  <div>
                    <p className="text-gray-700 font-semibold">تعليق على المنشور (مطلوب تلقائياً)</p>
                    <p className="text-gray-500 text-sm">Comment on Post (Auto-required)</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M15 19l-7-7 7-7" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </section>

        {/* Section 2.5: Trigger Word Details */}
        <section className="rounded-xl shadow-sm p-6 space-y-4" style={{ backgroundColor: "#FEF9C3" }}>
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">تفاصيل التفعيل</h2>
          </div>
          <p className="text-sm text-gray-600">Trigger Word Details</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الكلمة المشغلة *</label>
              <Input
                value={triggerWord}
                onChange={(e) => setTriggerWord(e.target.value)}
                placeholder="مثال: مهتم"
                className="text-right bg-white"
              />
              <p className="text-xs text-gray-600 mt-1">الكلمة التي تبدأ الأتمتة عند كتابتها</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الكلمات المستبعدة</label>
              <Input
                value={excludedWords}
                onChange={(e) => setExcludedWords(e.target.value)}
                placeholder="مثال: غير مهتم، لا أريد"
                className="text-right bg-white"
              />
              <p className="text-xs text-gray-600 mt-1">الكلمات التي توقف الأتمتة</p>
            </div>

            <div>
              <Button
                variant="outline"
                className="gap-2 text-white bg-transparent"
                style={{ backgroundColor: "#7C3AED" }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                أضف كلمات مشابهة
              </Button>
              <div className="flex flex-wrap gap-2 mt-3">
                {similarWords.map((word, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Target Posts */}
        <section className="rounded-xl shadow-sm p-6 space-y-4" style={{ backgroundColor: "#FFFBEB" }}>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">المنشورات المستهدفة</h2>
            <p className="text-sm text-gray-500">Target Posts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instagram */}
            <div
              className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                instagramPosts.length > 0 ? "border-yellow-500 bg-yellow-50" : "border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-bold text-gray-900">Instagram</p>
                    <p className="text-xs text-gray-600">
                      {instagramPosts.length > 0 ? `${instagramPosts.length} منشورات محددة` : "لم يتم التحديد"}
                    </p>
                  </div>
                </div>
                <input type="checkbox" checked={instagramPosts.length > 0} onChange={() => {}} className="w-5 h-5" />
              </div>
            </div>

            {/* Facebook */}
            <div
              className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                facebookPosts.length > 0 ? "border-yellow-500 bg-yellow-50" : "border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <div>
                    <p className="font-bold text-gray-900">Facebook</p>
                    <p className="text-xs text-gray-600">
                      {facebookPosts.length > 0 ? `${facebookPosts.length} منشورات محددة` : "لم يتم التحديد"}
                    </p>
                  </div>
                </div>
                <input type="checkbox" checked={facebookPosts.length > 0} onChange={() => {}} className="w-5 h-5" />
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600 bg-white p-3 rounded-lg flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            اترك فارغاً لتطبيق القاعدة على جميع المنشورات
          </p>
        </section>

        {/* Section 4: Actions (was Section 5) */}
        <section className="rounded-xl shadow-sm p-6 space-y-4" style={{ backgroundColor: "#D1FAE5" }}>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">الإجراءات (إذن - THEN) *</h2>
            <p className="text-sm text-gray-600">Actions (Required)</p>
            <p className="text-sm text-gray-700 mt-1">ماذا سيحدث عند تفعيل هذه الأتمتة؟</p>
          </div>

          <div className="space-y-4">
            {actions.map((action, index) => (
              <div key={action.id} className="bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {action.type === "dm" && (
                      <>
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <h4 className="font-semibold text-gray-700">إرسال رسالة خاصة</h4>
                      </>
                    )}
                    {action.type === "auto_reply" && (
                      <>
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <h4 className="font-semibold text-gray-700">رد تلقائي</h4>
                      </>
                    )}
                    {action.type === "save_contact" && (
                      <>
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z" />
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                        </svg>
                        <h4 className="font-semibold text-gray-700">حفظ جهة اتصال</h4>
                      </>
                    )}
                    {action.type === "add_tag" && (
                      <>
                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <h4 className="font-semibold text-gray-700">إضافة وسم</h4>
                      </>
                    )}
                  </div>
                  <button onClick={() => removeAction(action.id)} className="p-1 hover:bg-red-50 rounded">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                {(action.type === "dm" || action.type === "auto_reply") && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">نص الرسالة</label>
                    <Textarea
                      placeholder="اكتب رسالتك هنا..."
                      defaultValue={action.message}
                      rows={3}
                      className="text-right"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Variables: {"{"}الاسم{"}"} {"{"}المنشور{"}"} {"{"}التاريخ{"}"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Character count: 0/1000</p>
                  </div>
                )}

                {action.type === "save_contact" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">تسجيل في</label>
                    <Select defaultValue={action.category}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="حفظ الفيديو">حفظ الفيديو (Saved Video)</SelectItem>
                        <SelectItem value="مشاركة المنشور">مشاركة المنشور (Shared Post)</SelectItem>
                        <SelectItem value="إعجاب بالمحتوى">إعجاب بالمحتوى (Liked Content)</SelectItem>
                        <SelectItem value="متابع جديد">متابع جديد (New Follower)</SelectItem>
                        <SelectItem value="مهتم بالمنتج">مهتم بالمنتج (Interested in Product)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Purpose: تسجيل العميل ضمن فئة في الـ Analytics</p>
                  </div>
                )}

                {action.type === "add_tag" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الوسم</label>
                    <Input
                      placeholder="مثال: مهتم، حفظ الفيديو، متابع نشط"
                      defaultValue={action.tagName}
                      className="text-right mb-2"
                    />
                    <p className="text-xs text-gray-500 mb-2">Suggested tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {["مهتم", "نشط", "حفظ الفيديو", "مشارك"].map((tag) => (
                        <button
                          key={tag}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => addAction("dm")}
                variant="outline"
                className="gap-2"
                style={{ backgroundColor: "#10B981", color: "white" }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                رسالة خاصة
              </Button>
              <Button
                onClick={() => addAction("auto_reply")}
                variant="outline"
                className="gap-2"
                style={{ backgroundColor: "#10B981", color: "white" }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                رد تلقائي
              </Button>
              <Button
                onClick={() => addAction("save_contact")}
                variant="outline"
                className="gap-2"
                style={{ backgroundColor: "#10B981", color: "white" }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                حفظ جهة اتصال
              </Button>
              <Button
                onClick={() => addAction("add_tag")}
                variant="outline"
                className="gap-2"
                style={{ backgroundColor: "#10B981", color: "white" }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                إضافة وسم
              </Button>
            </div>
          </div>
        </section>

        {/* Section 5: Milestones (was Section 6) */}
        <section
          className="rounded-xl shadow-sm p-6 space-y-4"
          style={{ backgroundColor: "#DBEAFE", borderWidth: "2px", borderColor: "#3B82F6" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h2 className="text-xl font-bold text-gray-900">نظام المكافآت التدريجية</h2>
                <p className="text-sm text-gray-600">Milestones Rewards System</p>
              </div>
            </div>
            <button
              onClick={() => setMilestonesEnabled(!milestonesEnabled)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                milestonesEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                  milestonesEnabled ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {milestonesEnabled && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">أرسل رسائل تشجيعية عند الوصول لأهداف محددة</p>

              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="bg-white p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {index === 0 && (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {milestone.threshold} {milestone.metric === "clicks" ? "نقرات على الرابط" : milestone.metric}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{milestone.message}</p>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                onClick={addMilestone}
                className="w-full gap-2"
                style={{ backgroundColor: "#10B981", color: "white" }}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                إضافة محطة جديدة
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="outline" className="gap-2 bg-transparent">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            إلغاء
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 bg-transparent" onClick={handleSaveDraft} disabled={saving}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z" />
              </svg>
              {saving ? "جاري الحفظ..." : "حفظ كمسودة"}
            </Button>
            <Button className="gap-2 text-white" style={{ backgroundColor: "#7C3AED" }} onClick={handleSaveAndActivate} disabled={saving}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {saving ? "جاري الحفظ..." : "حفظ وتفعيل"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

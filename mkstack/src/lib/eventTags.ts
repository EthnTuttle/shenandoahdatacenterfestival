export const EVENT_TAGS = {
  DATACENTER_FESTIVAL: 'datacenter-festival',
  INFRASTRUCTURE: 'infrastructure',
  SUSTAINABILITY: 'sustainability',
  COOLING: 'cooling',
  NETWORKING: 'networking',
  AI_HARDWARE: 'ai-hardware',
  SECURITY: 'security',
  EFFICIENCY: 'efficiency',
  DISCUSSION: 'discussion',
  FACT_RESOURCE: 'fact-resource',
  COMMUNITY: 'community',
} as const;

export type EventTag = typeof EVENT_TAGS[keyof typeof EVENT_TAGS];

export const TAG_DESCRIPTIONS: Record<EventTag, string> = {
  [EVENT_TAGS.DATACENTER_FESTIVAL]: 'Shenandoah Datacenter Festival content',
  [EVENT_TAGS.INFRASTRUCTURE]: 'Datacenter infrastructure topics',
  [EVENT_TAGS.SUSTAINABILITY]: 'Environmental and sustainability discussions',
  [EVENT_TAGS.COOLING]: 'Cooling systems and thermal management',
  [EVENT_TAGS.NETWORKING]: 'Network infrastructure and protocols',
  [EVENT_TAGS.AI_HARDWARE]: 'AI and machine learning hardware',
  [EVENT_TAGS.SECURITY]: 'Security and compliance topics',
  [EVENT_TAGS.EFFICIENCY]: 'Energy efficiency and optimization',
  [EVENT_TAGS.DISCUSSION]: 'General community discussions',
  [EVENT_TAGS.FACT_RESOURCE]: 'Shared resources and links',
  [EVENT_TAGS.COMMUNITY]: 'Community announcements and events',
};

export function getTagsForContent(content: string, contentType: 'discussion' | 'fact'): EventTag[] {
  const tags: EventTag[] = [];

  // Always add the datacenter festival tag
  tags.push(EVENT_TAGS.DATACENTER_FESTIVAL);

  // Add content type tag
  if (contentType === 'discussion') {
    tags.push(EVENT_TAGS.DISCUSSION);
  } else {
    tags.push(EVENT_TAGS.FACT_RESOURCE);
  }

  // Add community tag for all content
  tags.push(EVENT_TAGS.COMMUNITY);

  const lowerContent = content.toLowerCase();

  // Check for specific topics
  if (lowerContent.includes('cooling') || lowerContent.includes('thermal') || lowerContent.includes('hvac')) {
    tags.push(EVENT_TAGS.COOLING);
  }

  if (lowerContent.includes('sustain') || lowerContent.includes('environment') || lowerContent.includes('green') || lowerContent.includes('carbon')) {
    tags.push(EVENT_TAGS.SUSTAINABILITY);
  }

  if (lowerContent.includes('network') || lowerContent.includes('protocol') || lowerContent.includes('tcp') || lowerContent.includes('http')) {
    tags.push(EVENT_TAGS.NETWORKING);
  }

  if (lowerContent.includes('infrastructure') || lowerContent.includes('server') || lowerContent.includes('datacenter')) {
    tags.push(EVENT_TAGS.INFRASTRUCTURE);
  }

  if (lowerContent.includes('ai') || lowerContent.includes('machine learning') || lowerContent.includes('tpu') || lowerContent.includes('gpu')) {
    tags.push(EVENT_TAGS.AI_HARDWARE);
  }

  if (lowerContent.includes('security') || lowerContent.includes('compliance') || lowerContent.includes('encryption')) {
    tags.push(EVENT_TAGS.SECURITY);
  }

  if (lowerContent.includes('efficiency') || lowerContent.includes('power') || lowerContent.includes('energy') || lowerContent.includes('optimization')) {
    tags.push(EVENT_TAGS.EFFICIENCY);
  }

  return [...new Set(tags)]; // Remove duplicates
}

export function isValidEventTag(tag: string): tag is EventTag {
  return Object.values(EVENT_TAGS).includes(tag as EventTag);
}
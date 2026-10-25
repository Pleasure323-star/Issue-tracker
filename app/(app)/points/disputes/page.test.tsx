import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';

const requireUser = vi.hoisted(() => vi.fn());
const currentTenantIdFor = vi.hoisted(() => vi.fn());
const isTenantAdmin = vi.hoisted(() => vi.fn());
const isAdmin = vi.hoisted(() => vi.fn());
const disputesForMember = vi.hoisted(() => vi.fn());
const entriesForMember = vi.hoisted(() => vi.fn());
const openDisputes = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth-helpers', () => ({ requireUser }));
vi.mock('@/lib/tenant-context', () => ({ currentTenantIdFor }));
vi.mock('@/lib/agents/membership', () => ({ isTenantAdmin }));
vi.mock('@/lib/roles', () => ({ isAdmin }));
vi.mock('@/lib/prisma', () => ({ prisma: {} }));
vi.mock('@/lib/points/disputes', () => ({ disputesForMember, entriesForMember, openDisputes }));
vi.mock('@/components/ui/badge', () => ({ Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => <span className={className}>{children}</span> }));
vi.mock('@/components/local-time', () => ({ LocalTime: ({ date }: { date: Date }) => <time>{date.toISOString()}</time> }));
vi.mock('./dispute-controls', () => ({ DisputeControls: () => <div /> }));
vi.mock('./credit-awards-form', () => ({ CreditAwardsForm: () => <div /> }));

import PointsDisputesPage from './page';

const entry = { id: 'e1', points: -10, role: 'solver', bugNumber: 123, bugTitle: 'Fix bug', correctedAt: null };

async function render() {
  const page = (await PointsDisputesPage()) as ReactElement;
  return renderToStaticMarkup(page);
}

describe('points disputes page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUser.mockResolvedValue({ id: 'u1', role: 'user' });
    currentTenantIdFor.mockResolvedValue('t1');
    isAdmin.mockReturnValue(false);
    isTenantAdmin.mockResolvedValue(false);
    disputesForMember.mockResolvedValue([]);
    openDisputes.mockResolvedValue([]);
    entriesForMember.mockResolvedValue([entry]);
  });

  it('renders dispute action as a single focusable link with accessible name', async () => {
    const html = await render();
    expect(html).not.toMatch(/<a[^>]+>[\s\S]*?<button/i);
    expect(html).not.toMatch(/<button[^>]+>[\s\S]*?<a/i);
    expect(html).toMatch(/<a[^>]+href="[^"]*disputes\/new\?entry=e1[^"]*"/);
    expect(html).toMatch(/aria-label="[^"]*Dispute entry for issue #123[^"]*"/);
    const disputeLinks = html.match(/<a[^>]+>[\s\S]*?Dispute[\s\S]*?<\/a>/g) || [];
    expect(disputeLinks.length).toBeGreaterThan(0);
  });
});

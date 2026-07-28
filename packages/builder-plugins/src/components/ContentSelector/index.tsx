import React, { useState, useEffect } from 'react';

interface HitItem {
  id: string;
  name?: string;
  data?: { url?: string; title?: string; slug?: string };
}

interface ContentSelectorProps {
  models: { name: string; displayName: string }[];
  apiKey: string;
  onContentSelect: (content: { id: string; name: string; type: string; href: string }) => void;
  onClose: () => void;
}

export const ContentSelector: React.FC<ContentSelectorProps> = ({
  onContentSelect,
  models,
  apiKey,
  onClose,
}) => {
  const [selectedHit, setSelectedHit] = useState<HitItem | null>(null);
  const [searchResults, setSearchResults] = useState<HitItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    if (selectedModel && apiKey) {
      setIsLoading(true);
      const url = new URL(`https://cdn.builder.io/api/v2/content/${selectedModel}`);
      url.searchParams.set('apiKey', apiKey);
      url.searchParams.set('limit', '100');
      url.searchParams.set('noTargeting', 'true');
      url.searchParams.set('includeRefs', 'true');
      url.searchParams.set('fields', 'id,name,data.title,data.url,data.slug');
      fetch(url.toString())
        .then((r) => r.json())
        .then((data) =>
          setSearchResults(
            (data.results || [])
              .filter((r: HitItem) => typeof r.id === 'string')
              .map((r: HitItem) => ({ id: r.id, name: r.name, data: r.data }))
          )
        )
        .catch(() => setSearchResults([]))
        .finally(() => setIsLoading(false));
    } else {
      setSearchResults([]);
    }
    setSelectedHit(null);
    setSearchQuery('');
  }, [selectedModel, apiKey]);

  const filtered = searchResults.filter((hit) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (hit.name?.toLowerCase() || '').includes(q) ||
      (hit.data?.title?.toLowerCase() || '').includes(q) ||
      (hit.data?.url?.toLowerCase() || '').includes(q)
    );
  });

  const handleSelect = (hit: HitItem) => {
    setSelectedHit(hit);
    let href = hit.data?.url || hit.data?.slug || '';
    if (href && !href.startsWith('/')) href = '/' + href;
    onContentSelect({ id: hit.id, name: hit.name || hit.data?.title || '', type: selectedModel, href });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(120,120,140,0.55)',
          zIndex: 99998,
        }}
      />

      {/* Panel — anchored near top-center */}
      <div
        style={{
          position: 'fixed',
          top: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: 560,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
          zIndex: 99999,
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header row: Type selector + close */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderBottom: selectedModel ? '1px solid #e5e7eb' : 'none',
          }}
        >
          <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, flexShrink: 0 }}>
            Type:
          </span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              flex: 1,
              height: 32,
              padding: '0 8px',
              fontSize: 13,
              border: '1.5px solid #2196f3',
              borderRadius: 4,
              background: '#fff',
              color: '#374151',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Select a content type...</option>
            {models.map((m) => (
              <option key={m.name} value={m.name}>{m.displayName}</option>
            ))}
          </select>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              color: '#9ca3af',
              padding: '2px 4px',
              lineHeight: 1,
              flexShrink: 0,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Search + results — only when model selected */}
        {selectedModel && (
          <>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: 30,
                  padding: '0 8px',
                  fontSize: 12,
                  border: '1px solid #d1d5db',
                  borderRadius: 4,
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#374151',
                }}
              />
            </div>

            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {isLoading ? (
                <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
                  Loading...
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
                  {searchQuery ? `No results for "${searchQuery}"` : 'No content found'}
                </div>
              ) : (
                filtered.map((hit) => (
                  <div
                    key={hit.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 16px',
                      borderBottom: '1px solid #f3f4f6',
                      background: selectedHit?.id === hit.id ? '#e3f2fd' : undefined,
                      gap: 8,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1565c0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {hit.name || hit.data?.title || hit.id}
                      </div>
                      {hit.data?.url && (
                        <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {hit.data.url}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleSelect(hit)}
                      style={{
                        flexShrink: 0,
                        height: 26,
                        padding: '0 12px',
                        fontSize: 12,
                        fontWeight: 500,
                        background: selectedHit?.id === hit.id ? '#1976d2' : '#2196f3',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      {selectedHit?.id === hit.id ? 'Selected' : 'Select'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ContentSelector;

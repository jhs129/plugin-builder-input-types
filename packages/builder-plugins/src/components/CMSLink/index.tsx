import React, { useState, ChangeEvent, useEffect } from 'react';
import { ContentSelector } from '../ContentSelector';

export interface CMSLinkProps {
  value: {
    get(key: 'type' | 'href' | 'model' | 'referenceId'): string | undefined;
    type: 'url' | 'model';
    href: string;
    model?: string;
    referenceId?: string;
  };
  onChange: (value: {
    type: 'url' | 'model';
    href: string;
    model?: string;
    referenceId?: string;
  }) => void;
  defaultType?: 'url' | 'model';
  apiKey: string;
  models: {
    name: string;
    displayName: string;
  }[];
}

const label: React.CSSProperties = {
  fontSize: 11,
  color: '#888',
  width: 38,
  flexShrink: 0,
  letterSpacing: 0.2,
};

const inputBase: React.CSSProperties = {
  flex: 1,
  height: 28,
  padding: '0 8px',
  fontSize: 12,
  background: 'transparent',
  border: '1px solid #bbb',
  borderRadius: 4,
  color: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const row: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

export const CMSLink: React.FC<CMSLinkProps> = ({
  value,
  onChange,
  defaultType = 'url',
  apiKey,
  models,
}) => {
  const [type, setType] = useState<'url' | 'model'>(defaultType);
  const [href, setHref] = useState('');
  const [model, setModel] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [isContentSelectorOpen, setIsContentSelectorOpen] = useState(false);
  const [selectedContentName, setSelectedContentName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchContentName = async (modelName: string, contentId: string) => {
    try {
      const url = new URL(`https://cdn.builder.io/api/v2/content/${modelName}`);
      url.searchParams.set('apiKey', apiKey);
      url.searchParams.set('query.id', contentId);
      url.searchParams.set('limit', '1');
      url.searchParams.set('fields', 'id,name,data.title');
      const res = await fetch(url.toString());
      const data = await res.json();
      const content = data.results?.[0];
      setSelectedContentName(content ? (content.name || content.data?.title || contentId) : 'Content not found');
    } catch {
      setSelectedContentName('Error loading content');
    }
  };

  useEffect(() => {
    if (value?.get) {
      const savedType = value.get('type') as 'url' | 'model';
      const savedHref = value.get('href');
      const savedModel = value.get('model');
      const savedRefId = value.get('referenceId');

      setType(savedType || defaultType);
      setHref(savedHref || '');
      setModel(savedModel || '');
      setReferenceId(savedRefId || '');

      if (savedModel && savedRefId) {
        fetchContentName(savedModel, savedRefId);
      } else {
        setSelectedContentName('');
      }
    }
  }, [value, defaultType, apiKey]);

  const updateValue = (newValues: Record<string, string>) => {
    try {
      onChange({ type, href: href || '', model: model || '', referenceId: referenceId || '', ...newValues });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'url' | 'model';
    setType(newType);
    if (newType === 'url') {
      setModel('');
      setReferenceId('');
      setSelectedContentName('');
      updateValue({ type: newType, model: '', referenceId: '' });
    } else {
      updateValue({ type: newType });
    }
  };

  const handleLinkChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newHref = e.target.value;
    setHref(newHref);
    updateValue({ href: newHref });
  };

  const handleContentSelect = (content: { href: string; id: string; type: string; name: string }) => {
    setHref(content.href);
    setReferenceId(content.id);
    setModel(content.type);
    setSelectedContentName(content.name);
    setType('model');
    updateValue({ type: 'model', href: content.href, referenceId: content.id, model: content.type });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {/* Type row */}
      <div style={row}>
        <span style={label}>Type:</span>
        <select
          value={type}
          onChange={handleTypeChange}
          style={{
            ...inputBase,
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        >
          <option value="url">URL</option>
          <option value="model">Reference</option>
        </select>
      </div>

      {/* Href row */}
      <div style={row}>
        <span style={label}>Href:</span>
        {type === 'url' ? (
          <input
            type="text"
            value={href}
            onChange={handleLinkChange}
            placeholder="https://..."
            style={inputBase}
          />
        ) : (
          <>
            <div style={{ ...inputBase, display: 'flex', alignItems: 'center', overflow: 'hidden', color: selectedContentName ? 'inherit' : '#aaa' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedContentName || 'No model selected...'}
              </span>
            </div>
            <button
              onClick={() => setIsContentSelectorOpen(true)}
              style={{
                height: 28,
                padding: '0 14px',
                fontSize: 12,
                fontWeight: 500,
                background: '#2196f3',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                flexShrink: 0,
                letterSpacing: 0.2,
              }}
            >
              Select
            </button>
          </>
        )}
      </div>

      {error && (
        <div style={{ fontSize: 11, color: '#ef5350', marginTop: 2 }}>{error}</div>
      )}

      {isContentSelectorOpen && (
        <ContentSelector
          models={models}
          apiKey={apiKey}
          onContentSelect={handleContentSelect}
          onClose={() => setIsContentSelectorOpen(false)}
        />
      )}
    </div>
  );
};

export default CMSLink;

import React, { useState } from 'react';

export interface GraphNode {
  id: string;
  type: string;
  data: {
    label: string;
    content?: string;
  };
}

export interface GraphState {
  nodes: GraphNode[];
}

interface SearchableExportViewProps {
  graphState: GraphState;
}

const SearchableExportView: React.FC<SearchableExportViewProps> = ({ graphState }) => {
  const [query, setQuery] = useState('');

  const filteredNodes = graphState.nodes.filter(node => 
    node.data.content?.toLowerCase().includes(query.toLowerCase()) || 
    node.data.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <input 
        type="text" 
        placeholder="Search your knowledge graph..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: '10px', width: '100%', marginBottom: '20px', boxSizing: 'border-box' }}
      />
      <div>
        {filteredNodes.length > 0 ? (
          filteredNodes.map(node => (
            <div key={node.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <h3>{node.data.label}</h3>
              {node.data.content && <p>{node.data.content}</p>}
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchableExportView;
// AI-Powered Property Manager Frontend
const AIPropertyManager = ComponentFactory.createComponent('AIPropertyManager', {
  defaultProps: {
    autoLoad: true
  }
})((props, helpers) => {
  const { useLocalState, useAsyncState } = helpers;
  
  const [state, updateState] = useLocalState({
    showAI: false,
    aiInsights: null,
    loading: false
  });

  // Load AI insights on mount
  const loadAIInsights = React.useCallback(async () => {
    try {
      updateState({ loading: true });
      const insights = await window.ApiService.get('/ai/analyze-portfolio');
      updateState({ aiInsights: insights, loading: false });
      
      // Show urgent alerts
      if (insights.urgent_actions?.length > 0) {
        showUrgentAlert(insights.urgent_actions[0]);
      }
    } catch (error) {
      console.error('Failed to load AI insights:', error);
      updateState({ loading: false });
    }
  }, []);

  React.useEffect(() => {
    if (props.autoLoad) {
      loadAIInsights();
    }
  }, [props.autoLoad, loadAIInsights]);

  const showUrgentAlert = (action) => {
    window.showNotification('warning', `AI Alert: ${action.action}`);
  };

  return React.createElement('div', { className: 'ai-property-manager' }, [
    React.createElement(AIDashboard, { 
      key: 'dashboard',
      insights: state.aiInsights,
      loading: state.loading
    }),
    
    // Floating AI Assistant
    React.createElement('button', {
      key: 'fab',
      className: 'ai-fab',
      onClick: () => updateState({ showAI: !state.showAI }),
      title: 'AI Assistant'
    }, [
      React.createElement('i', { key: 'icon', className: 'fas fa-robot' }),
      state.aiInsights?.urgent_actions?.length > 0 && React.createElement('span', {
        key: 'badge',
        className: 'ai-badge'
      }, state.aiInsights.urgent_actions.length)
    ]),
    
    state.showAI && React.createElement(AIAssistant, {
      key: 'assistant',
      onClose: () => updateState({ showAI: false })
    })
  ]);
});

// AI-Powered Dashboard
const AIDashboard = ComponentFactory.createComponent('AIDashboard', {})((props, helpers) => {
  const { insights, loading } = props;
  const { formatCurrency, useLocalState } = helpers;
  
  const [state, updateState] = useLocalState({
    selectedMetric: null
  });

  if (loading) {
    return React.createElement('div', { className: 'ai-loading' }, [
      React.createElement('div', { key: 'spinner', className: 'ai-spinner' }),
      React.createElement('p', { key: 'text' }, 'AI analyzing your portfolio...')
    ]);
  }

  if (!insights) {
    return React.createElement('div', { className: 'ai-placeholder' }, [
      React.createElement('i', { key: 'icon', className: 'fas fa-robot', style: { fontSize: '3rem', opacity: 0.3 } }),
      React.createElement('p', { key: 'text' }, 'AI insights will appear here once data is loaded')
    ]);
  }

  return React.createElement('div', { className: 'ai-dashboard-container' }, [
    // Hero Section
    React.createElement('div', { key: 'hero', className: 'ai-hero-section' }, [
      React.createElement('div', { className: 'ai-hero-content' }, [
        React.createElement('h1', { key: 'title', className: 'ai-hero-title' }, [
          'AI Property Intelligence',
          React.createElement('span', {
            key: 'indicator',
            className: 'ai-live-indicator'
          }, [
            React.createElement('span', { key: 'pulse', className: 'pulse' }),
            'LIVE'
          ])
        ]),
        React.createElement('p', { key: 'subtitle', className: 'ai-hero-subtitle' },
          'Your portfolio analyzed by AI in real-time'
        ),

        // Key Insight Cards
        React.createElement('div', { key: 'cards', className: 'ai-insight-cards' }, [
          React.createElement('div', {
            key: 'revenue',
            className: 'insight-card revenue',
            onClick: () => updateState({ selectedMetric: 'revenue' })
          }, [
            React.createElement('div', { key: 'icon', className: 'insight-icon' },
              React.createElement('i', { className: 'fas fa-dollar-sign' })
            ),
            React.createElement('div', { key: 'content', className: 'insight-content' }, [
              React.createElement('h3', { key: 'value' }, formatCurrency(insights.potential_monthly_increase || 0)),
              React.createElement('p', { key: 'label' }, 'Monthly Revenue Opportunity')
            ]),
            React.createElement('div', { key: 'action', className: 'insight-action' },
              React.createElement('button', {}, 'Optimize Now')
            )
          ]),

          React.createElement('div', {
            key: 'health',
            className: 'insight-card health',
            onClick: () => updateState({ selectedMetric: 'health' })
          }, [
            React.createElement('div', { key: 'icon', className: 'insight-icon' },
              React.createElement('i', { className: 'fas fa-chart-line' })
            ),
            React.createElement('div', { key: 'content', className: 'insight-content' }, [
              React.createElement('h3', { key: 'value' }, `${insights.portfolio_health_score || 0}%`),
              React.createElement('p', { key: 'label' }, 'Portfolio Health Score')
            ]),
            React.createElement('div', { key: 'action', className: 'insight-action' },
              React.createElement('button', {}, 'View Details')
            )
          ]),

          React.createElement('div', {
            key: 'opportunities',
            className: 'insight-card opportunities',
            onClick: () => updateState({ selectedMetric: 'opportunities' })
          }, [
            React.createElement('div', { key: 'icon', className: 'insight-icon' },
              React.createElement('i', { className: 'fas fa-lightbulb' })
            ),
            React.createElement('div', { key: 'content', className: 'insight-content' }, [
              React.createElement('h3', { key: 'value' }, insights.optimization_opportunities || 0),
              React.createElement('p', { key: 'label' }, 'Optimization Opportunities')
            ]),
            React.createElement('div', { key: 'action', className: 'insight-action' },
              React.createElement('button', {}, 'Explore')
            )
          ])
        ])
      ])
    ]),

    // Urgent Actions
    insights.urgent_actions?.length > 0 && React.createElement('div', {
      key: 'urgent',
      className: 'urgent-actions-section'
    }, [
      React.createElement('h2', { key: 'title' }, [
        React.createElement('i', { key: 'icon', className: 'fas fa-exclamation-triangle' }),
        'Urgent Actions Required'
      ]),
      React.createElement('div', { key: 'grid', className: 'urgent-actions-grid' },
        insights.urgent_actions.map((action, idx) =>
          React.createElement(UrgentActionCard, { key: idx, action })
        )
      )
    ])
  ]);
});

// Urgent Action Card Component
const UrgentActionCard = ComponentFactory.createComponent('UrgentActionCard', {})((props, helpers) => {
  const { action } = props;
  const { formatCurrency } = helpers;

  const handleTakeAction = () => {
    // Handle action based on type
    if (action.type === 'rent_optimization') {
      window.location.hash = '#/properties';
    }
  };

  return React.createElement('div', {
    className: `urgent-action-card priority-${action.priority}`
  }, [
    React.createElement('div', { key: 'header', className: 'action-header' }, [
      React.createElement('span', { key: 'type', className: 'action-type' }, action.type),
      React.createElement('span', { key: 'priority', className: `priority-badge ${action.priority}` }, action.priority)
    ]),
    React.createElement('p', { key: 'action', className: 'action-text' }, action.action),
    action.value && React.createElement('div', { key: 'value', className: 'action-value' },
      `Potential Value: ${formatCurrency(action.value)}`
    ),
    React.createElement('button', {
      key: 'button',
      className: 'btn btn-primary btn-sm',
      onClick: handleTakeAction
    }, 'Take Action')
  ]);
});

// AI Assistant Component
const AIAssistant = ComponentFactory.createComponent('AIAssistant', {})((props, helpers) => {
  const { onClose } = props;
  const { useLocalState } = helpers;

  const [state, updateState] = useLocalState({
    messages: [
      {
        role: 'assistant',
        content: "Hi! I'm your AI property assistant. I can help with rent optimization, tenant screening, maintenance predictions, and more. What would you like to know?"
      }
    ],
    input: '',
    loading: false
  });

  const suggestions = [
    "Optimize all my rents",
    "Show maintenance predictions", 
    "Generate listing for a unit",
    "Analyze my portfolio health"
  ];

  const sendMessage = async () => {
    if (!state.input.trim() || state.loading) return;

    const userMessage = { role: 'user', content: state.input };
    const newMessages = [...state.messages, userMessage];
    updateState({ messages: newMessages, input: '', loading: true });

    try {
      // Simulate AI response for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = generateAIResponse(state.input);
      updateState({
        messages: [...newMessages, { role: 'assistant', content: response }],
        loading: false
      });

    } catch (error) {
      updateState({ loading: false });
      window.showNotification('error', 'AI Assistant error');
    }
  };

  const generateAIResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('rent') || lowerInput.includes('optimize')) {
      return "I can help optimize your rents! Based on my analysis, I've identified several units with potential for rent increases. Would you like me to show you specific recommendations for your highest-opportunity properties?";
    }
    
    if (lowerInput.includes('maintenance') || lowerInput.includes('predict')) {
      return "I'm analyzing your properties for maintenance needs. I can predict when HVAC systems need service, when appliances might fail, and optimal timing for renovations. Would you like a specific property analyzed?";
    }
    
    if (lowerInput.includes('listing') || lowerInput.includes('market')) {
      return "I can generate compelling listing descriptions that attract quality tenants faster. Just give me a unit number and I'll create a professional listing with market-optimized pricing suggestions.";
    }
    
    return "I'm here to help with all aspects of property management using AI. I can optimize rents, predict maintenance, screen tenants, generate listings, and analyze your portfolio performance. What specific area would you like to explore?";
  };

  const handleQuickAction = (suggestion) => {
    updateState({ input: suggestion });
    sendMessage();
  };

  return React.createElement('div', { className: 'ai-assistant-window' }, [
    React.createElement('div', { key: 'header', className: 'ai-header' }, [
      React.createElement('div', { key: 'status', className: 'ai-status' }, [
        React.createElement('div', { key: 'avatar', className: 'ai-avatar' },
          React.createElement('i', { className: 'fas fa-robot' })
        ),
        React.createElement('div', { key: 'info' }, [
          React.createElement('h3', { key: 'title' }, 'AI Property Assistant'),
          React.createElement('span', { key: 'models', className: 'ai-models' }, 'GPT-4 • Gemini • ElevenLabs')
        ])
      ]),
      React.createElement('button', {
        key: 'close',
        className: 'close-btn',
        onClick: onClose
      }, React.createElement('i', { className: 'fas fa-times' }))
    ]),

    React.createElement('div', { key: 'messages', className: 'ai-messages' }, [
      ...state.messages.map((msg, idx) =>
        React.createElement('div', {
          key: idx,
          className: `message ${msg.role}`
        }, [
          msg.role === 'assistant' && React.createElement('div', {
            key: 'avatar',
            className: 'message-avatar'
          }, React.createElement('i', { className: 'fas fa-robot' })),
          React.createElement('div', { key: 'content', className: 'message-content' }, msg.content)
        ])
      ),
      
      state.loading && React.createElement('div', {
        key: 'loading',
        className: 'message assistant'
      }, [
        React.createElement('div', { key: 'avatar', className: 'message-avatar' },
          React.createElement('i', { className: 'fas fa-robot' })
        ),
        React.createElement('div', { key: 'typing', className: 'typing-indicator' }, [
          React.createElement('span', { key: '1' }),
          React.createElement('span', { key: '2' }), 
          React.createElement('span', { key: '3' })
        ])
      ])
    ]),

    React.createElement('div', { key: 'quick-actions', className: 'quick-actions' },
      suggestions.map((suggestion, idx) =>
        React.createElement('button', {
          key: idx,
          className: 'quick-action',
          onClick: () => handleQuickAction(suggestion)
        }, suggestion)
      )
    ),

    React.createElement('div', { key: 'input', className: 'ai-input-section' }, [
      React.createElement('input', {
        key: 'input',
        type: 'text',
        placeholder: 'Ask me anything about your properties...',
        value: state.input,
        onChange: (e) => updateState({ input: e.target.value }),
        onKeyPress: (e) => e.key === 'Enter' && sendMessage()
      }),
      React.createElement('button', {
        key: 'send',
        onClick: sendMessage,
        disabled: state.loading
      }, React.createElement('i', { className: 'fas fa-paper-plane' }))
    ])
  ]);
});

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.AIPropertyManager = AIPropertyManager;
window.AppModules.AIDashboard = AIDashboard;
window.AppModules.AIAssistant = AIAssistant;